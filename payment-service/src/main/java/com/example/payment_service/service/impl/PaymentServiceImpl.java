package com.example.payment_service.service.impl;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.RefundRequest;
import com.example.payment_service.exception.PaymentException;
import com.example.payment_service.gateway.GatewayFactory;
import com.example.payment_service.gateway.PaymentGateway;
import com.example.payment_service.model.Payment;
import com.example.payment_service.repository.PaymentRepository;
import com.example.payment_service.service.JwtService;
import com.example.payment_service.service.NotificationService;
import com.example.payment_service.service.PaymentService;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final GatewayFactory gatewayFactory;
    private final NotificationService notificationService;
    private final JwtService jwtService;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              GatewayFactory gatewayFactory,
                              NotificationService notificationService,
                              JwtService jwtService) {
        this.paymentRepository = paymentRepository;
        this.gatewayFactory = gatewayFactory;
        this.notificationService = notificationService;
        this.jwtService = jwtService;
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request, String jwtToken) {
        jwtService.validateToken(jwtToken);
        Long userIdFromToken = jwtService.extractUserId(jwtToken);

        paymentRepository.findByOrderIdAndPaymentMethod(request.getOrderId(), request.getPaymentMethod())
                .ifPresent(existing -> {
                    throw PaymentException.conflict("PAYMENT_DUPLICATED",
                            "Ya existe un pago para la orden y metodo proporcionados");
                });

        Payment payment = buildPendingPayment(request, userIdFromToken);
        paymentRepository.save(payment);

        PaymentGateway gateway = gatewayFactory.getGateway(request.getPaymentMethod());
        try {
            PaymentResponse response = gateway.processPayment(request);
            updatePaymentAsPaid(payment, response);
            notificationService.notifyPaymentSuccess(payment)
                    .doOnError(error -> log.error("No se pudo notificar pago {}", payment.getId(), error))
                    .subscribe();
            return response;
        } catch (PaymentException ex) {
            log.error("Error de dominio al procesar pago {}", payment.getId(), ex);
            markAsFailed(payment);
            notificationService.notifyPaymentFailure(payment)
                    .doOnError(error -> log.error("No se pudo notificar fallo {}", payment.getId(), error))
                    .subscribe();
            throw ex;
        } catch (Exception ex) {
            log.error("Error inesperado al procesar pago {}", payment.getId(), ex);
            markAsFailed(payment);
            notificationService.notifyPaymentFailure(payment)
                    .doOnError(error -> log.error("No se pudo notificar fallo {}", payment.getId(), error))
                    .subscribe();
            throw PaymentException.gatewayError("GATEWAY_ERROR", "El gateway no respondio correctamente", ex);
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
                .orElseThrow(() -> PaymentException.notFound("PAYMENT_NOT_FOUND", "Pago no encontrado para la orden"));
        return mapToResponse(payment);
    }

    @Override
    public PaymentResponse processRefund(Long paymentId, RefundRequest request, String jwtToken) {
        jwtService.validateToken(jwtToken);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> PaymentException.notFound("PAYMENT_NOT_FOUND", "Pago no encontrado"));

        if (request.getPaymentId() != null && !request.getPaymentId().equals(paymentId.toString())) {
            throw PaymentException.badRequest("REFUND_ID_MISMATCH", "El paymentId del cuerpo no coincide con el path");
        }

        if (payment.getStatus() != Payment.PaymentStatus.PAID) {
            throw PaymentException.badRequest("INVALID_STATUS", "Solo pagos PAID pueden reembolsarse");
        }

        BigDecimal remaining = payment.getAmount().subtract(payment.getRefundedAmount());
        if (request.getAmount().compareTo(remaining) > 0) {
            throw PaymentException.badRequest("INVALID_AMOUNT", "El monto del reembolso excede el saldo disponible");
        }

        PaymentGateway gateway = gatewayFactory.getGateway(payment.getPaymentMethod());
        PaymentResponse response = gateway.processRefund(request);

        BigDecimal newRefundedTotal = payment.getRefundedAmount()
                .add(request.getAmount())
                .setScale(2, RoundingMode.HALF_UP);
        payment.setRefundedAmount(newRefundedTotal);
        if (newRefundedTotal.compareTo(payment.getAmount()) >= 0) {
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
        } else {
            payment.setStatus(Payment.PaymentStatus.PAID);
        }
        paymentRepository.save(payment);
        notificationService.notifyPaymentSuccess(payment)
                .doOnError(error -> log.error("No se pudo notificar reembolso {}", payment.getId(), error))
                .subscribe();
        return response;
    }

    @Override
    public void handleWebhookEvent(String provider, String payload) {
        log.info("Evento de webhook recibido desde {}: {}", provider, payload);
    }

    private Payment buildPendingPayment(PaymentRequest request, Long userId) {
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setUserId(userId);
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setGatewayType(request.getPaymentMethod().name());
        payment.setRefundedAmount(BigDecimal.ZERO);
        return payment;
    }

    private void updatePaymentAsPaid(Payment payment, PaymentResponse response) {
        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setGatewayTransactionId(response.getTransactionId());
        payment.setGatewayType(response.getGateway());
        paymentRepository.save(payment);
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