package com.example.payment_service.gateway;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.RefundRequest;
import com.example.payment_service.exception.PaymentException;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class StripeGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(StripeGateway.class);

    private final WebClient webClient;
    private final long simulatedDelayMs;

    public StripeGateway(
            WebClient.Builder builder,
            @Value("${payment.gateways.stripe.base-url:https://api.stripe.com/v1}") String baseUrl,
            @Value("${payment.gateways.stripe.simulated-delay-ms:150}") long simulatedDelayMs) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.simulatedDelayMs = simulatedDelayMs;
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        simulateLatency();
        if (request.getAmount().compareTo(new BigDecimal("5000")) > 0) {
            throw PaymentException.gatewayError("STRIPE_LIMIT", "Stripe rechazó el monto solicitado");
        }
        return PaymentResponse.builder()
                .transactionId("stripe_tx_" + System.currentTimeMillis())
                .status("PAID")
                .amount(request.getAmount())
                .gateway(getGatewayName())
                .build();
    }

    @Override
    public PaymentResponse processRefund(RefundRequest request) {
        simulateLatency();
        return PaymentResponse.builder()
                .transactionId("stripe_refund_" + System.currentTimeMillis())
                .status("REFUNDED")
                .amount(request.getAmount())
                .gateway(getGatewayName())
                .build();
    }

    public boolean validateWebhook(String payload, String signature) {
        log.debug("Validando webhook: {}", payload);
        return signature != null && signature.startsWith("whsec");
    }

    @Override
    public String getGatewayName() {
        return "stripe";
    }

    private void simulateLatency() {
        try {
            Thread.sleep(simulatedDelayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

