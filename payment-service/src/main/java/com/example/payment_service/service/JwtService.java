package com.example.payment_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import java.util.Map;

@Service
public class JwtService {

    @Value("${integration.django.jwt-secret:mi-clave-secreta-jwt-muy-segura-para-ecommerce}")
    private String secretKey;

    public void validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token);
        } catch (Exception e) {
            throw new RuntimeException("JWT invalido o expirado");
        }
    }

    /**
     * Extrae el user_id del JWT generado por el Auth-Service (PHP)
     * El JWT de PHP tiene la estructura:
     * {
     *   "data": {
     *     "user_id": 1,
     *     "email": "..."
     *   }
     * }
     */
    public Long extractUserId(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();

        // El JWT de PHP tiene los datos dentro de un objeto "data"
        Object dataObj = claims.get("data");
        if (dataObj instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) dataObj;
            Object userIdObj = data.get("user_id");
            if (userIdObj != null) {
                return Long.valueOf(userIdObj.toString());
            }
        }

        // Fallback: intentar extraer directamente (por si el formato cambia)
        Object userIdObj = claims.get("user_id");
        if (userIdObj != null) {
            return Long.valueOf(userIdObj.toString());
        }

        throw new RuntimeException("No se pudo extraer user_id del token JWT");
    }
}
