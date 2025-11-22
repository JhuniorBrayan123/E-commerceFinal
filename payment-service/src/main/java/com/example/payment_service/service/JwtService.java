package com.example.payment_service.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    public Long extractUserId(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();

        return Long.valueOf(claims.get("user_id").toString());
    }
}
