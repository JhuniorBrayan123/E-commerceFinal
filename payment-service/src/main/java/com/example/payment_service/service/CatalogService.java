package com.example.payment_service.service;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.payment_service.model.OrderItem;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

@Service
public class CatalogService {

    private static final Logger log = LoggerFactory.getLogger(CatalogService.class);

    private final WebClient webClient;
    private final String djangoBaseUrl;
    private final ObjectMapper objectMapper;

    // Usar la configuración del YAML
    public CatalogService(WebClient.Builder webClientBuilder,
            @Value("${django.service.url}") String djangoBaseUrl,
            ObjectMapper objectMapper) {
        this.djangoBaseUrl = djangoBaseUrl;
        this.webClient = webClientBuilder
                .baseUrl(djangoBaseUrl)
                .build();
        this.objectMapper = objectMapper;

        log.info("🔧 CatalogService configurado con URL: {}", djangoBaseUrl);
    }

    /**
     * Verifica la disponibilidad de stock antes de procesar el pago
     * Retorna un Mono<Boolean> que indica si hay stock suficiente
     */
    public Mono<Boolean> checkStockAvailability(List<OrderItem> items, String jwtToken) {
        log.info("🔍 Verificando disponibilidad de stock para {} items", items.size());

        List<Map<String, Object>> payload = items.stream()
                .map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("sensor_id", item.getSensorId());
                    itemMap.put("cantidad", item.getCantidad());
                    return itemMap;
                })
                .toList();

        log.info("🌐 Llamando a Django para verificar stock: {}/deduct-stock/", djangoBaseUrl);

        return webClient.post()
                .uri("/deduct-stock/")
                .headers(h -> {
                    if (jwtToken != null && !jwtToken.isBlank()) {
                        h.setBearerAuth(jwtToken.replace("Bearer ", ""));
                    }
                    h.set("Content-Type", "application/json");
                })
                .bodyValue(payload)
                .exchangeToMono(response -> {
                    return response.bodyToMono(String.class)
                            .defaultIfEmpty("{}")
                            .flatMap(body -> {
                                try {
                                    JsonNode json = objectMapper.readTree(body);
                                    boolean success = json.has("success") && json.get("success").asBoolean();
                                    boolean hasErrors = json.has("errors") && json.get("errors").isArray() 
                                            && json.get("errors").size() > 0;
                                    
                                    if (response.statusCode().is2xxSuccessful() && success && !hasErrors) {
                                        log.info("✅ Stock disponible para todos los items");
                                        return Mono.just(true);
                                    } else {
                                        String errorMsg = json.has("message") 
                                                ? json.get("message").asText() 
                                                : "Stock insuficiente";
                                        log.error("❌ Stock insuficiente - HTTP {}: {}", response.statusCode().value(), errorMsg);
                                        return Mono.error(new RuntimeException("Stock insuficiente: " + body));
                                    }
                                } catch (Exception e) {
                                    log.error("❌ Error parseando respuesta de stock: {}", e.getMessage());
                                    if (response.statusCode().is2xxSuccessful()) {
                                        return Mono.just(true); // Si no podemos parsear pero es 200, asumimos OK
                                    } else {
                                        return Mono.error(new RuntimeException("Error validando stock: " + body));
                                    }
                                }
                            });
                })
                .timeout(Duration.ofSeconds(5))
                .doOnError(e -> log.error("💥 Error verificando stock: {}", e.getMessage()));
    }

    public Mono<String> deductStock(List<OrderItem> items, String jwtToken) {
        log.info("📦 Descontando stock para {} items", items.size());

        List<Map<String, Object>> payload = items.stream()
                .map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("sensor_id", item.getSensorId());
                    itemMap.put("cantidad", item.getCantidad());
                    log.info("📦 Item: sensor_id={}, cantidad={}",
                            item.getSensorId(), item.getCantidad());
                    return itemMap;
                })
                .toList();

        log.info("🌐 Llamando a Django: {}/deduct-stock/", djangoBaseUrl);

        return webClient.post()
                .uri("/deduct-stock/")
                .headers(h -> {
                    if (jwtToken != null && !jwtToken.isBlank()) {
                        h.setBearerAuth(jwtToken.replace("Bearer ", ""));
                        log.info("🔑 JWT Token incluído");
                    }
                    h.set("Content-Type", "application/json");
                })
                .bodyValue(payload)
                .exchangeToMono(response -> {
                    log.info("📡 Respuesta Django - Status: {}", response.statusCode());
                    if (response.statusCode().is2xxSuccessful()) {
                        return response.bodyToMono(String.class);
                    } else {
                        return response.bodyToMono(String.class)
                                .defaultIfEmpty("[sin mensaje]")
                                .flatMap(body -> {
                                    log.error("❌ ERROR Django - HTTP {}: {}", response.statusCode().value(), body);
                                    return Mono.error(new RuntimeException("Error Django: " + body));
                                });
                    }
                })
                .timeout(Duration.ofSeconds(10))
                .doOnSubscribe(sub -> log.info("🔄 Iniciando llamada a Django..."))
                .doOnSuccess(r -> log.info("✅ Stock descontado correctamente: {}", r))
                .doOnError(e -> log.error("💥 Error llamando a Django: {}", e.getMessage()));
    }
}
