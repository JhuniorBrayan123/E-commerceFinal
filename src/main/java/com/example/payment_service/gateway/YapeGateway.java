package com.example.payment_service.gateway;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.RefundRequest;
import com.example.payment_service.exception.PaymentException;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class YapeGateway implements PaymentGateway {

    private final long simulatedDelayMs;
    private final BigDecimal failureThreshold;

    public YapeGateway(
            @Value("${payment.gateways.yape.simulated-delay-ms:200}") long simulatedDelayMs,
            @Value("${payment.gateways.yape.failure-threshold:3000}") BigDecimal failureThreshold) {
        this.simulatedDelayMs = simulatedDelayMs;
        this.failureThreshold = failureThreshold;
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        simulateLatency();
        if (request.getAmount().compareTo(failureThreshold) > 0) {
            throw PaymentException.gatewayError("YAPE_LIMIT", "El monto excede el límite de Yape");
        }
        return PaymentResponse.builder()
                .transactionId("yape_tx_" + System.currentTimeMillis())
                .status("PAID")
                .amount(request.getAmount())
                .gateway(getGatewayName())
                .build();
    }

    @Override
    public PaymentResponse processRefund(RefundRequest request) {
        simulateLatency();
        return PaymentResponse.builder()
                .transactionId("yape_refund_" + System.currentTimeMillis())
                .status("REFUNDED")
                .amount(request.getAmount())
                .gateway(getGatewayName())
                .build();
    }

    @Override
    public String getGatewayName() {
        return "yape";
    }

    private void simulateLatency() {
        try {
            Thread.sleep(simulatedDelayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

