package com.example.payment_service.gateway;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.RefundRequest;
import com.example.payment_service.exception.PaymentException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;

@Component
public class YapeGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(YapeGateway.class);

    private final WebClient webClient;
    private final long simulatedDelayMs;
    private final BigDecimal maxTransactionLimit;

    public YapeGateway(WebClient.Builder builder,
            @Value("${payment.gateways.yape.base-url:https://api.yape.com.pe/v1}") String baseUrl,
            @Value("${payment.gateways.yape.simulated-delay-ms:100}") long simulatedDelayMs) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.simulatedDelayMs = simulatedDelayMs;
        this.maxTransactionLimit = new BigDecimal("3000"); // Límite de Yape en soles
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        simulateLatency();

        // Validar límite de Yape
        if (request.getAmount().compareTo(maxTransactionLimit) > 0) {
            throw PaymentException.gatewayError("YAPE_LIMIT", "El monto excede el limite de Yape");
        }

        // Simulación de llamada a API de Yape
        log.info("Procesando pago Yape por {}", request.getAmount());

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

        log.info("Procesando reembolso Yape por {}", request.getAmount());

        return PaymentResponse.builder()
                .transactionId("yape_refund_" + System.currentTimeMillis())
                .status("REFUNDED")
                .amount(request.getAmount())
                .gateway(getGatewayName())
                .build();
    }

    public boolean validateWebhook(String payload, String signature) {
        log.debug("Validando webhook Yape: {}", payload);
        // Validación simple de firma Yape
        return signature != null && signature.startsWith("yape_whsec_");
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
