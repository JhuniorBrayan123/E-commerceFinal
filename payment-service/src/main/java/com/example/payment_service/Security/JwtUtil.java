package com.example.payment_service.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException | UnsupportedJwtException
                | MalformedJwtException | SignatureException | IllegalArgumentException e) {
            throw new RuntimeException("JWT token invalido", e);
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
    public Long getUserIdFromToken(String token) {
        Claims claims = validateToken(token);

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