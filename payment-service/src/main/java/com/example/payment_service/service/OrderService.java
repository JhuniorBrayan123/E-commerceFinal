package com.example.payment_service.service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.payment_service.dto.ConfirmPaymentRequest;
import com.example.payment_service.dto.ConfirmPaymentResponse;
import com.example.payment_service.dto.OrderRequest;
import com.example.payment_service.dto.OrderResponse;
import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.exception.PaymentException;
import com.example.payment_service.model.Order;
import com.example.payment_service.model.OrderItem;
import com.example.payment_service.model.Payment;
import com.example.payment_service.repository.OrderRepository;
import com.example.payment_service.repository.PaymentRepository;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final JwtService jwtService;
    private final PaymentService paymentService;
    private final CatalogService catalogService;

    private static final String PAYMENT_TOKEN_PREFIX = "pay_token_";
    private static final SecureRandom random = new SecureRandom();

    public OrderService(
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            JwtService jwtService,
            PaymentService paymentService,
            CatalogService catalogService
    ) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.jwtService = jwtService;
        this.paymentService = paymentService;
        this.catalogService = catalogService;
    }

    /**
     * Crea una nueva orden de pago
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest request, String jwtToken) {
        jwtService.validateToken(jwtToken);
        Long userId = jwtService.extractUserId(jwtToken);

        Order order = new Order();
        order.setUserId(userId);
        order.setTotal(request.getTotal());
        order.setCurrency(request.getCurrency());
        order.setStatus(Order.OrderStatus.PENDING);

        String paymentToken = generatePaymentToken();
        order.setPaymentToken(paymentToken);

        final Order savedOrder = orderRepository.save(order);

        List<OrderItem> items = request.getItems().stream().map(itemRequest -> {
            OrderItem item = new OrderItem();
            item.setOrder(savedOrder);
            item.setSensorId(itemRequest.getSensorId());
            item.setNombre(itemRequest.getNombre());
            item.setCantidad(itemRequest.getCantidad());
            item.setPrecioUnitario(itemRequest.getPrecioUnitario());
            item.setSubtotal(itemRequest.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(itemRequest.getCantidad())));
            return item;
        }).collect(Collectors.toList());

        savedOrder.setItems(items);

        Order finalOrder = orderRepository.save(savedOrder);

        return buildOrderResponse(finalOrder);
    }

    /**
     * Confirma y procesa el pago de una orden
     */
    @Transactional
    public ConfirmPaymentResponse confirmPayment(ConfirmPaymentRequest request, String jwtToken) {

        jwtService.validateToken(jwtToken);
        Long userId = jwtService.extractUserId(jwtToken);

        Order order = orderRepository.findByPaymentToken(request.getPaymentToken())
                .orElseThrow(() -> PaymentException.notFound("ORDER_NOT_FOUND", "Orden no encontrada"));

        if (!order.getUserId().equals(userId)) {
            throw PaymentException.forbidden("FORBIDDEN", "No tiene permisos para acceder a esta orden");
        }

        if (!order.getId().equals(request.getOrderId())) {
            throw PaymentException.badRequest("INVALID_ORDER_ID", "El orderId no coincide con el paymentToken");
        }

        if (order.getTotal().compareTo(request.getAmount()) != 0) {
            throw PaymentException.badRequest("INVALID_AMOUNT", "El monto no coincide con el total de la orden");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw PaymentException.conflict("ORDER_ALREADY_PROCESSED", "La orden ya fue procesada");
        }

        final Order finalOrder = order;

        finalOrder.setStatus(Order.OrderStatus.PROCESSING);
        orderRepository.save(finalOrder);

        try {
            // Construir PaymentRequest incluyendo items
            PaymentRequest paymentRequest = new PaymentRequest();
            paymentRequest.setOrderId(finalOrder.getId());
            paymentRequest.setAmount(request.getAmount());
            paymentRequest.setCurrency(request.getCurrency());
            paymentRequest.setPaymentMethod(request.getPaymentMethod());
            paymentRequest.setItems(finalOrder.getItems());

            // 1️⃣ Procesar el pago en gateway
            paymentService.processPayment(paymentRequest, jwtToken);

            // 2️⃣ Obtener Payment guardado en BD por PaymentService
            Payment payment = paymentRepository.findByOrderId(finalOrder.getId())
                    .orElseThrow(() -> PaymentException.notFound(
                    "PAYMENT_NOT_FOUND", "Pago no encontrado después de procesarlo"
            ));

            // 3️⃣ Cambiar estado a PAID
            finalOrder.setStatus(Order.OrderStatus.PAID);
            orderRepository.save(finalOrder);

            // 4️⃣ DESCONTAR STOCK EN DJANGO
            try {
                log.info(">> Enviando solicitud a Django para descontar stock...");

                catalogService.deductStock(finalOrder.getItems(), jwtToken)
                        .doOnSuccess(v -> log.info(">> Stock descontado correctamente en Django"))
                        .doOnError(err -> log.error(">> Error al descontar stock en Django: {}", err.getMessage()))
                        .block(); // <--- esperamos la respuesta SOLO aquí

            } catch (Exception e) {
                log.error(">> ERROR CRÍTICO: No se pudo descontar el stock en Django", e);
            }

            // 5️⃣ Construir respuesta de éxito
            ConfirmPaymentResponse response = new ConfirmPaymentResponse();
            response.setSuccess(true);
            response.setMessage("Pago procesado exitosamente");

            ConfirmPaymentResponse.PaymentData paymentData = new ConfirmPaymentResponse.PaymentData();
            paymentData.setPaymentId(payment.getId());
            paymentData.setOrderId(finalOrder.getId());
            paymentData.setStatus(payment.getStatus().name());
            paymentData.setTransactionId(payment.getGatewayTransactionId());
            paymentData.setAmount(payment.getAmount());
            paymentData.setCurrency(request.getCurrency());
            paymentData.setPaymentMethod(request.getPaymentMethod());
            paymentData.setProcessedAt(LocalDateTime.now());

            response.setData(paymentData);
            return response;
        } catch (PaymentException e) {

            finalOrder.setStatus(Order.OrderStatus.FAILED);
            orderRepository.save(finalOrder);

            ConfirmPaymentResponse response = new ConfirmPaymentResponse();
            response.setSuccess(false);
            response.setMessage("El pago no pudo ser procesado");

            ConfirmPaymentResponse.ErrorData errorData = new ConfirmPaymentResponse.ErrorData();
            errorData.setCode(e.getErrorCode() != null ? e.getErrorCode() : "PAYMENT_FAILED");
            errorData.setMessage(e.getMessage() != null ? e.getMessage() : "Error al procesar el pago");

            response.setError(errorData);
            return response;

        } catch (Exception e) {

            finalOrder.setStatus(Order.OrderStatus.FAILED);
            orderRepository.save(finalOrder);

            log.error("Error inesperado al procesar la orden {}: {}", finalOrder.getId(), e.getMessage(), e);

            ConfirmPaymentResponse response = new ConfirmPaymentResponse();
            response.setSuccess(false);
            response.setMessage("El pago no pudo ser procesado");

            ConfirmPaymentResponse.ErrorData errorData = new ConfirmPaymentResponse.ErrorData();
            errorData.setCode("PAYMENT_FAILED");
            errorData.setMessage("Error inesperado al procesar el pago: " + e.getMessage());

            response.setError(errorData);
            return response;
        }
    }

    /**
     * Obtiene el estado de una orden
     */
    public OrderResponse getOrderStatus(Long orderId, String jwtToken) {
        jwtService.validateToken(jwtToken);
        Long userId = jwtService.extractUserId(jwtToken);

        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> PaymentException.notFound("ORDER_NOT_FOUND", "Orden no encontrada"));

        return buildOrderResponse(order);
    }

    /**
     * Genera un paymentToken único
     */
    private String generatePaymentToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        StringBuilder token = new StringBuilder(PAYMENT_TOKEN_PREFIX);
        for (byte b : bytes) {
            token.append(String.format("%02x", b));
        }
        return token.toString();
    }

    /**
     * Construye la respuesta de orden
     */
    private OrderResponse buildOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setSuccess(true);
        response.setMessage("Orden creada exitosamente");

        OrderResponse.OrderData orderData = new OrderResponse.OrderData();
        orderData.setOrderId(order.getId());
        orderData.setPaymentToken(order.getPaymentToken());
        orderData.setTotal(order.getTotal());
        orderData.setCurrency(order.getCurrency());
        orderData.setStatus(order.getStatus().name());
        orderData.setCreatedAt(order.getCreatedAt());

        List<OrderResponse.OrderItemResponse> itemsResponse
                = order.getItems().stream().map(item -> {
                    OrderResponse.OrderItemResponse itemResponse
                            = new OrderResponse.OrderItemResponse();
                    itemResponse.setSensorId(item.getSensorId());
                    itemResponse.setNombre(item.getNombre());
                    itemResponse.setCantidad(item.getCantidad());
                    itemResponse.setPrecioUnitario(item.getPrecioUnitario());
                    itemResponse.setSubtotal(item.getSubtotal());
                    return itemResponse;
                }).collect(Collectors.toList());

        orderData.setItems(itemsResponse);
        response.setData(orderData);

        return response;
    }
}
