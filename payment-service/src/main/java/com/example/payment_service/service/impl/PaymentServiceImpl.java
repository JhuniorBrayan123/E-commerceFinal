package com.example.payment_service.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import com.example.payment_service.dto.PaymentItemDto;
import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.RefundRequest;
import com.example.payment_service.event.PaymentCompletedEvent;
import com.example.payment_service.exception.PaymentException;
import com.example.payment_service.gateway.GatewayFactory;
import com.example.payment_service.gateway.PaymentGateway;
import com.example.payment_service.model.OrderItem;
import com.example.payment_service.model.Payment;
import com.example.payment_service.repository.PaymentRepository;
import com.example.payment_service.service.CatalogService;
import com.example.payment_service.service.JwtService;
import com.example.payment_service.service.NotificationService;
import com.example.payment_service.service.PaymentService;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final GatewayFactory gatewayFactory;
    private final NotificationService notificationService;
    private final JwtService jwtService;
    private final CatalogService catalogService;
    private final ApplicationEventPublisher eventPublisher;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            GatewayFactory gatewayFactory,
            NotificationService notificationService,
            JwtService jwtService,
            CatalogService catalogService,
            ApplicationEventPublisher eventPublisher
    ) {
        this.paymentRepository = paymentRepository;
        this.gatewayFactory = gatewayFactory;
        this.notificationService = notificationService;
        this.jwtService = jwtService;
        this.catalogService = catalogService;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request, String jwtToken) {
        // VERIFICACIÓN EXTREMA AL INICIO
        log.info("🎯🎯🎯 PAYMENT SERVICE - INICIANDO processPayment");
        log.info("📦 OrderId: {}, Items: {}", request.getOrderId(),
                request.getItems() != null ? request.getItems().size() : "NULL");

        if (request.getItems() != null) {
            request.getItems().forEach(item
                    -> log.info("   - Sensor: {}, Cantidad: {}", item.getSensorId(), item.getCantidad())
            );
        }

        jwtService.validateToken(jwtToken);
        Long userIdFromToken = jwtService.extractUserId(jwtToken);

        paymentRepository.findByOrderIdAndPaymentMethod(request.getOrderId(), request.getPaymentMethod())
                .ifPresent(existing -> {
                    throw PaymentException.conflict(
                            "PAYMENT_DUPLICATED",
                            "Ya existe un pago para esta orden y método"
                    );
                });

        Payment payment = buildPendingPayment(request, userIdFromToken);
        paymentRepository.save(payment);

        log.info("➡ Procesando pago para orderId={}, items={}", request.getOrderId(), request.getItems());

        PaymentGateway gateway = gatewayFactory.getGateway(request.getPaymentMethod());

        try {
            PaymentResponse response = gateway.processPayment(request);

            // MARCAR COMO PAID y persistir (dentro de la transacción actual)
            payment.setStatus(Payment.PaymentStatus.PAID);
            payment.setGatewayTransactionId(response.getTransactionId());
            payment.setGatewayType(response.getGateway());
            paymentRepository.save(payment);

            log.info("✔ Pago {} guardado como PAID (orderId={})", payment.getId(), payment.getOrderId());

            // Obtener items del Order (no del Payment para evitar problemas de colecciones compartidas)
            // Los items se pasan en el request y están asociados al Order
            List<OrderItem> items = request.getItems();
            if (items == null || items.isEmpty()) {
                log.warn("⚠️ No hay items en el request, intentando obtener del Order...");
                // Si no hay items en el request, intentar obtenerlos del Order
                // Esto requeriría inyectar OrderRepository, pero por ahora usamos los del request
                items = java.util.Collections.emptyList();
            }
            log.info("📦 Items procesados: {}", items.size());
            items.forEach(item -> log.info("   - Cantidad: {}Sensor: {}, ", item.getSensorId(), item.getCantidad()));

            // NOTA: El stock ya fue descontado ANTES de procesar el pago (en OrderService.confirmPayment)
            // No es necesario descontarlo de nuevo aquí
            log.info("✅ Stock ya descontado en la validación previa al pago");

            // Publicar evento para notificaciones (el stock ya está descontado)
            // Convertir OrderItem → PaymentItemDto (sin entidades JPA)
                List<PaymentItemDto> itemDtos = items.stream()
                        .map(it -> new PaymentItemDto(
                                it.getSensorId(),
                                it.getCantidad(),
                                it.getNombre(),
                                it.getPrecioUnitario()
                        ))
                        .collect(Collectors.toList());

                // Publicar evento con DTOs (seguro, sin colecciones compartidas)
                PaymentCompletedEvent evt = new PaymentCompletedEvent(
                        payment.getOrderId(),
                        payment.getId(),
                        itemDtos,
                        jwtToken
                );

            eventPublisher.publishEvent(evt);
            log.info("📢 Evento PaymentCompleted publicado para payment {}", payment.getId());

            notificationService.notifyPaymentSuccess(payment)
                    .subscribe(
                            ok -> log.info("Notificación finalizada: {}", ok),
                            err -> log.error("Error inesperado en notificación", err)
                    );

            return response;

        } catch (PaymentException ex) {
            markAsFailed(payment);
            notificationService.notifyPaymentFailure(payment).subscribe();
            throw ex;

        } catch (Exception ex) {
            log.error("💥 ERROR real en gateway o procesoPayment: {}", ex.getMessage(), ex);
            markAsFailed(payment);
            notificationService.notifyPaymentFailure(payment).subscribe();
            throw PaymentException.gatewayError("GATEWAY_ERROR", "Error en el gateway", ex);
        }
    }

    @Override
    public PaymentResponse getPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> PaymentException.notFound("PAYMENT_NOT_FOUND", "Pago no encontrado"));
        return mapToResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByOrder(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> PaymentException.notFound("PAYMENT_NOT_FOUND", "Pago no encontrado"));
        return mapToResponse(payment);
    }

    @Override
    public PaymentResponse processRefund(Long paymentId, RefundRequest request, String jwtToken) {

        jwtService.validateToken(jwtToken);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> PaymentException.notFound("PAYMENT_NOT_FOUND", "Pago no encontrado"));

        if (payment.getStatus() != Payment.PaymentStatus.PAID) {
            throw PaymentException.badRequest("INVALID_STATUS", "Solo pagos PAID pueden reembolsarse");
        }

        PaymentGateway gateway = gatewayFactory.getGateway(payment.getPaymentMethod());
        PaymentResponse response = gateway.processRefund(request);

        BigDecimal updated = payment.getRefundedAmount()
                .add(request.getAmount())
                .setScale(2, RoundingMode.HALF_UP);

        payment.setRefundedAmount(updated);
        payment.setStatus(updated.compareTo(payment.getAmount()) >= 0
                ? Payment.PaymentStatus.REFUNDED
                : Payment.PaymentStatus.PAID);

        paymentRepository.save(payment);

        notificationService.notifyPaymentSuccess(payment).subscribe();

        return response;
    }

    @Override
    public void handleWebhookEvent(String provider, String payload) {
        log.info("Webhook de {} recibido: {}", provider, payload);
    }

    private Payment buildPendingPayment(PaymentRequest request, Long userId) {
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setUserId(userId);
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setRefundedAmount(BigDecimal.ZERO);
        payment.setGatewayType(request.getPaymentMethod().name());
        
        // NOTA: Los items NO se asignan al Payment
        // Los items pertenecen solo al Order y se obtienen desde ahí cuando se necesiten
        // Esto evita el error "Found shared references to a collection"
        
        return payment;
    }


    private void markAsFailed(Payment payment) {
        payment.setStatus(Payment.PaymentStatus.FAILED);
        paymentRepository.save(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .transactionId(payment.getGatewayTransactionId())
                .status(payment.getStatus().name())
                .amount(payment.getAmount())
                .gateway(payment.getGatewayType())
                .build();
    }
}
