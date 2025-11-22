package com.example.payment_service.service;

import com.example.payment_service.dto.OrderRequest;
import com.example.payment_service.dto.OrderResponse;
import com.example.payment_service.dto.ConfirmPaymentRequest;
import com.example.payment_service.dto.ConfirmPaymentResponse;
import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.model.Order;
import com.example.payment_service.model.OrderItem;
import com.example.payment_service.model.Payment;
import com.example.payment_service.repository.OrderRepository;
import com.example.payment_service.repository.PaymentRepository;
import com.example.payment_service.exception.PaymentException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final JwtService jwtService;
    private final PaymentService paymentService;
    private static final String PAYMENT_TOKEN_PREFIX = "pay_token_";
    private static final SecureRandom random = new SecureRandom();

    public OrderService(OrderRepository orderRepository, PaymentRepository paymentRepository, JwtService jwtService, PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.jwtService = jwtService;
        this.paymentService = paymentService;
    }

    /**
     * Crea una nueva orden de pago
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest request, String jwtToken) {
        // Validar JWT y extraer user_id
        jwtService.validateToken(jwtToken);
        Long userId = jwtService.extractUserId(jwtToken);

        // Crear la orden
        Order order = new Order();
        order.setUserId(userId);
        order.setTotal(request.getTotal());
        order.setCurrency(request.getCurrency());
        order.setStatus(Order.OrderStatus.PENDING);

        // Generar paymentToken único
        String paymentToken = generatePaymentToken();
        order.setPaymentToken(paymentToken);

        // Guardar la orden primero para obtener el ID
        final Order savedOrder = orderRepository.save(order);

        // Crear los items de la orden
        List<OrderItem> items = request.getItems().stream().map(itemRequest -> {
            OrderItem item = new OrderItem();
            item.setOrder(savedOrder);
            item.setSensorId(itemRequest.getSensorId());
            item.setNombre(itemRequest.getNombre());
            item.setCantidad(itemRequest.getCantidad());
            item.setPrecioUnitario(itemRequest.getPrecioUnitario());
            item.setSubtotal(itemRequest.getPrecioUnitario().multiply(BigDecimal.valueOf(itemRequest.getCantidad())));
            return item;
        }).collect(Collectors.toList());

        savedOrder.setItems(items);

        // Guardar la orden nuevamente con los items
        Order finalOrder = orderRepository.save(savedOrder);

        // Construir respuesta
        return buildOrderResponse(finalOrder);
    }

    /**
     * Confirma y procesa el pago de una orden
     */
    @Transactional
    public ConfirmPaymentResponse confirmPayment(ConfirmPaymentRequest request, String jwtToken) {
        // Validar JWT y extraer user_id
        jwtService.validateToken(jwtToken);
        Long userId = jwtService.extractUserId(jwtToken);

        // Buscar la orden por paymentToken
        Order order = orderRepository.findByPaymentToken(request.getPaymentToken())
                .orElseThrow(() -> PaymentException.notFound("ORDER_NOT_FOUND", "Orden no encontrada"));

        // Verificar que la orden pertenece al usuario
        if (!order.getUserId().equals(userId)) {
            throw PaymentException.forbidden("FORBIDDEN", "No tiene permisos para acceder a esta orden");
        }

        // Verificar que el orderId coincida
        if (!order.getId().equals(request.getOrderId())) {
            throw PaymentException.badRequest("INVALID_ORDER_ID", "El orderId no coincide con el paymentToken");
        }

        // Verificar que el monto coincida
        if (order.getTotal().compareTo(request.getAmount()) != 0) {
            throw PaymentException.badRequest("INVALID_AMOUNT", "El monto no coincide con el total de la orden");
        }

        // Verificar que la orden esté en estado PENDING
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw PaymentException.conflict("ORDER_ALREADY_PROCESSED", "La orden ya fue procesada");
        }

        // Hacer order final para usarla en los bloques catch
        final Order finalOrder = order;
        
        // Cambiar estado a PROCESSING
        finalOrder.setStatus(Order.OrderStatus.PROCESSING);
        orderRepository.save(finalOrder);

        try {
            // Procesar el pago usando el PaymentService existente
            PaymentRequest paymentRequest = new PaymentRequest();
            paymentRequest.setOrderId(finalOrder.getId());
            paymentRequest.setAmount(request.getAmount());
            paymentRequest.setCurrency(request.getCurrency());
            paymentRequest.setPaymentMethod(request.getPaymentMethod());

            // Procesar el pago
            paymentService.processPayment(paymentRequest, jwtToken);

            // Obtener el Payment creado de la base de datos
            Payment payment = paymentRepository.findByOrderId(finalOrder.getId())
                    .orElseThrow(() -> PaymentException.notFound("PAYMENT_NOT_FOUND", "Pago no encontrado después de procesarlo"));

            // Actualizar estado de la orden a PAID
            finalOrder.setStatus(Order.OrderStatus.PAID);
            orderRepository.save(finalOrder);

            // Construir respuesta de éxito
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
            // Actualizar estado de la orden a FAILED
            finalOrder.setStatus(Order.OrderStatus.FAILED);
            orderRepository.save(finalOrder);

            // Construir respuesta de error
            ConfirmPaymentResponse response = new ConfirmPaymentResponse();
            response.setSuccess(false);
            response.setMessage("El pago no pudo ser procesado");

            ConfirmPaymentResponse.ErrorData errorData = new ConfirmPaymentResponse.ErrorData();
            errorData.setCode(e.getErrorCode() != null ? e.getErrorCode() : "PAYMENT_FAILED");
            errorData.setMessage(e.getMessage() != null ? e.getMessage() : "Error al procesar el pago");

            response.setError(errorData);
            return response;

        } catch (Exception e) {
            // Actualizar estado de la orden a FAILED
            finalOrder.setStatus(Order.OrderStatus.FAILED);
            orderRepository.save(finalOrder);

            // Construir respuesta de error
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
        // Validar JWT y extraer user_id
        jwtService.validateToken(jwtToken);
        Long userId = jwtService.extractUserId(jwtToken);

        // Buscar la orden
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

        List<OrderResponse.OrderItemResponse> itemsResponse = order.getItems().stream().map(item -> {
            OrderResponse.OrderItemResponse itemResponse = new OrderResponse.OrderItemResponse();
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

