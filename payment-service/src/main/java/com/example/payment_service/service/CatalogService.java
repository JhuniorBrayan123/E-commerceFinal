package com.example.payment_service.service;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.payment_service.model.OrderItem;

import reactor.core.publisher.Mono;

@Service
public class CatalogService {

    private static final Logger log = LoggerFactory.getLogger(CatalogService.class);

    private final WebClient webClient;

    public CatalogService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("http://localhost:8000/api") // URL FIJA CORRECTA
                .build();
    }

    public Mono<String> deductStock(List<OrderItem> items, String jwtToken) {
        log.info("📞 Descontando stock para {} items", items.size());

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

        log.info("🎯 Llamando a Django: http://localhost:8000/api/deduct-stock/");

        return webClient.post()
                .uri("/deduct-stock/") // PATH FIJO CORRECTO
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
                .doOnSubscribe(sub -> log.info("🔌 Iniciando llamada a Django..."))
                .doOnSuccess(r -> log.info("✅ Stock descontado correctamente: {}", r))
                .doOnError(e -> log.error("💥 Error llamando a Django: {}", e.getMessage()));
    }
}
