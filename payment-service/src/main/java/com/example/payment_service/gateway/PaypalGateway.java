package com.example.payment_service.gateway;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.RefundRequest;
import com.example.payment_service.exception.PaymentException;
import java.time.Duration;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PaypalGateway implements PaymentGateway {

    private final Duration minDelay;
    private final Duration maxDelay;

    public PaypalGateway(
            @Value("${payment.gateways.paypal.min-delay-ms:100}") long minDelayMs,
            @Value("${payment.gateways.paypal.max-delay-ms:400}") long maxDelayMs) {
        this.minDelay = Duration.ofMillis(minDelayMs);
        this.maxDelay = Duration.ofMillis(maxDelayMs);
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        simulateLatency();
        if (ThreadLocalRandom.current().nextInt(10) == 0) {
            throw PaymentException.gatewayError("PAYPAL_TEMPORARY", "Paypal temporalmente no disponible");
        }
        return PaymentResponse.builder()
                .transactionId("paypal_tx_" + System.currentTimeMillis())
                .status("PAID")
                .amount(request.getAmount())
                .gateway(getGatewayName())
                .build();
    }

    @Override
    public PaymentResponse processRefund(RefundRequest request) {
        simulateLatency();
        return PaymentResponse.builder()
                .transactionId("paypal_refund_" + System.currentTimeMillis())
                .status("REFUNDED")
                .amount(request.getAmount())
                .gateway(getGatewayName())
                .build();
    }

    @Override
    public String getGatewayName() {
        return "paypal";
    }

    private void simulateLatency() {
        long randomDelay = ThreadLocalRandom.current()
                .nextLong(minDelay.toMillis(), maxDelay.toMillis());
        try {
            Thread.sleep(randomDelay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
