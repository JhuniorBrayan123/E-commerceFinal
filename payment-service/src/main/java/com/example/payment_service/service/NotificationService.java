package com.example.payment_service.service;

import com.example.payment_service.model.Payment;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final WebClient webClient;
    private final Retry retrySpec;

    public NotificationService(WebClient.Builder webClientBuilder,
                               @Value("${notification.base-url}") String baseUrl,
                               @Value("${notification.retry-attempts:3}") int retryAttempts,
                               @Value("${notification.retry-backoff-ms:500}") long backoffMillis) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.retrySpec = Retry.backoff(retryAttempts, Duration.ofMillis(backoffMillis));
    }

    public Mono<String> notifyPaymentSuccess(Payment payment) {
        return sendNotification("/api/orders/" + payment.getOrderId() + "/payment-success", payment);
    }

    public Mono<String> notifyPaymentFailure(Payment payment) {
        return sendNotification("/api/orders/" + payment.getOrderId() + "/payment-failed", payment);
    }

    private Mono<String> sendNotification(String uri, Payment payment) {
        return webClient.post()
                .uri(uri)
                .bodyValue(buildNotificationPayload(payment))
                .retrieve()
                .bodyToMono(String.class)
                .retryWhen(retrySpec)
                .doOnSuccess(body -> log.info("Notificacion enviada {}", uri))
                .doOnError(error -> log.error("Error notificando {}", uri, error));
    }

    private Map<String, Object> buildNotificationPayload(Payment payment) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("order_id", payment.getOrderId());
        payload.put("user_id", payment.getUserId());
        payload.put("amount", payment.getAmount());
        payload.put("currency", payment.getCurrency().name());
        payload.put("method", payment.getPaymentMethod().name());
        payload.put("status", payment.getStatus().name());
        payload.put("gateway_transaction_id", payment.getGatewayTransactionId());
        payload.put("timestamp", payment.getCreatedAt() != null ? payment.getCreatedAt().toString() : null);
        return payload;
    }
}
