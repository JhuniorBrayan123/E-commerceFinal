package com.example.payment_service.service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
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
    private final CouponService couponService;
    private final com.example.payment_service.repository.SensorRepository sensorRepository; // ← NUEVO REPO

    private static final String PAYMENT_TOKEN_PREFIX = "pay_token_";
    private static final SecureRandom random = new SecureRandom();

    public OrderService(
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            JwtService jwtService,
            PaymentService paymentService,
            CatalogService catalogService,
            CouponService couponService,
            com.example.payment_service.repository.SensorRepository sensorRepository // ← INYECCIÓN
    ) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.jwtService = jwtService;
        this.paymentService = paymentService;
        this.catalogService = catalogService;
        this.couponService = couponService;
        this.sensorRepository = sensorRepository;
    }

    /**
     * Crea una nueva orden de pago
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest request, String jwtToken) {
        jwtService.validateToken(jwtToken);
        Long userId = jwtService.extractUserId(jwtToken);

        // Calcular subtotal (total antes de descuentos)
        BigDecimal subtotal = request.getTotal();
        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCode = null;

        // Si hay un cupón, validarlo y calcular descuento
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            couponCode = request.getCouponCode().trim().toUpperCase();
            log.info("Validando cupón: {}", couponCode);

            var couponValidation = couponService.validateCoupon(couponCode, subtotal, userId);

            if (couponValidation.isValid()) {
                discountAmount = couponValidation.getDiscount();
                log.info("Cupón válido. Descuento aplicado: {}", discountAmount);
            } else {
                log.warn("Cupón inválido: {}. Mensaje: {}", couponCode, couponValidation.getMessage());
                // No lanzar excepción, simplemente no aplicar descuento
                couponCode = null;
            }
        }

        // Calcular total final (subtotal - descuento)
        BigDecimal finalTotal = subtotal.subtract(discountAmount);

        Order order = new Order();
        order.setUserId(userId);
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setCouponCode(couponCode);
        order.setTotal(finalTotal); // Total con descuento aplicado
        order.setCurrency(request.getCurrency());
        order.setStatus(Order.OrderStatus.PENDING);

        String paymentToken = generatePaymentToken();
        order.setPaymentToken(paymentToken);

        final Order savedOrder = orderRepository.save(order);

        List<OrderItem> items = request.getItems().stream().map(itemRequest -> {
            OrderItem item = new OrderItem();
            item.setOrder(savedOrder);

            // BUSCAR Y ASIGNAR SENSOR REAL (Validación implícita)
            com.example.payment_service.model.Sensor sensor = sensorRepository.findById(itemRequest.getSensorId())
                    .orElseThrow(() -> PaymentException.notFound("SENSOR_NOT_FOUND",
                            "Sensor no encontrado: " + itemRequest.getSensorId()));

            item.setSensor(sensor);
            item.setNombre(itemRequest.getNombre());
            item.setCantidad(itemRequest.getCantidad());
            item.setPrecioUnitario(itemRequest.getPrecioUnitario());
            item.setSubtotal(itemRequest.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(itemRequest.getCantidad())));
            return item;
        }).collect(Collectors.toList());

        savedOrder.setItems(items);

        Order finalOrder = orderRepository.save(savedOrder);

        // Si se aplicó un cupón válido, registrar su uso
        if (couponCode != null && discountAmount.compareTo(BigDecimal.ZERO) > 0) {
            couponService.registerCouponUsage(couponCode, userId, finalOrder.getId(),
                    discountAmount, subtotal);
        }

        return buildOrderResponse(finalOrder);
    }

    /**
     * Confirma y procesa el pago de una orden
     */
    @Transactional(rollbackFor = Exception.class)
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

        // Comparar montos con tolerancia para decimales (redondeo a 2 decimales)
        BigDecimal orderTotal = order.getTotal().setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal requestAmount = request.getAmount().setScale(2, java.math.RoundingMode.HALF_UP);
        if (orderTotal.compareTo(requestAmount) != 0) {
            log.error("Monto no coincide: orden={}, request={}", orderTotal, requestAmount);
            throw PaymentException.badRequest("INVALID_AMOUNT",
                    String.format("El monto no coincide con el total de la orden. Esperado: %s, Recibido: %s",
                            orderTotal, requestAmount));
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw PaymentException.conflict("ORDER_ALREADY_PROCESSED", "La orden ya fue procesada");
        }

        final Order finalOrder = order;

        // 0️⃣ VALIDAR Y DESCONTAR STOCK ANTES DE PROCESAR EL PAGO
        // Nota: El endpoint deduct-stock valida Y descuenta. Si pasa, el stock ya está
        // descontado.
        try {
            log.info("🔍 Validando y descontando stock antes de procesar el pago...");
            Boolean stockAvailable = catalogService.checkStockAvailability(finalOrder.getItems(), jwtToken)
                    .block(Duration.ofSeconds(5));

            if (stockAvailable == null || !stockAvailable) {
                throw PaymentException.badRequest("INSUFFICIENT_STOCK",
                        "No hay stock suficiente para completar la orden");
            }
            log.info("✅ Stock validado y descontado correctamente");
        } catch (RuntimeException e) {
            log.error("❌ Error validando/descontando stock: {}", e.getMessage());
            // Si el error contiene información de stock insuficiente, extraer el mensaje
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("Stock insuficiente")) {
                throw PaymentException.badRequest("INSUFFICIENT_STOCK",
                        "Stock insuficiente para uno o más productos en la orden");
            }
            throw PaymentException.badRequest("STOCK_VALIDATION_ERROR",
                    "Error al validar el stock: " + e.getMessage());
        } catch (Exception e) {
            log.error("❌ Error inesperado validando stock: {}", e.getMessage(), e);
            throw PaymentException.badRequest("STOCK_VALIDATION_ERROR",
                    "Error al validar el stock: " + e.getMessage());
        }

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

            // 1️⃣ Procesar el pago en gateway (ahora sabemos que hay stock disponible)
            paymentService.processPayment(paymentRequest, jwtToken);

            // 2️⃣ Obtener Payment guardado en BD por PaymentService
            Payment payment = paymentRepository.findByOrderId(finalOrder.getId())
                    .orElseThrow(() -> PaymentException.notFound(
                            "PAYMENT_NOT_FOUND", "Pago no encontrado después de procesarlo"));

            // 3️⃣ Cambiar estado a PAID
            finalOrder.setStatus(Order.OrderStatus.PAID);
            orderRepository.save(finalOrder);

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
            // Usar nueva transacción para guardar el estado FAILED
            markOrderAsFailed(finalOrder.getId());

            ConfirmPaymentResponse response = new ConfirmPaymentResponse();
            response.setSuccess(false);
            response.setMessage("El pago no pudo ser procesado");

            ConfirmPaymentResponse.ErrorData errorData = new ConfirmPaymentResponse.ErrorData();
            errorData.setCode(e.getErrorCode() != null ? e.getErrorCode() : "PAYMENT_FAILED");
            errorData.setMessage(e.getMessage() != null ? e.getMessage() : "Error al procesar el pago");

            response.setError(errorData);
            return response;

        } catch (Exception e) {
            // Usar nueva transacción para guardar el estado FAILED
            markOrderAsFailed(finalOrder.getId());

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
     * Marca una orden como fallida usando una nueva transacción
     * Esto evita el error "Transaction silently rolled back"
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markOrderAsFailed(Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElse(null);
            if (order != null) {
                order.setStatus(Order.OrderStatus.FAILED);
                orderRepository.save(order);
                log.info("Orden {} marcada como FAILED", orderId);
            }
        } catch (Exception e) {
            log.error("Error al marcar orden {} como FAILED: {}", orderId, e.getMessage(), e);
            // No relanzar la excepción para no afectar la respuesta
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

        // Agregar información de cupones
        orderData.setSubtotal(order.getSubtotal());
        orderData.setDiscountAmount(order.getDiscountAmount());
        orderData.setCouponCode(order.getCouponCode());

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
