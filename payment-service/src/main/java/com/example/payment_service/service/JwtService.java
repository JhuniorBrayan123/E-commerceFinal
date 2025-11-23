package com.example.payment_service.service;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;

@Service
public class JwtService {

    // Usar jwt.secret directamente (mismo que auth-service)
    @Value("${jwt.secret:mi-clave-secreta-jwt-muy-segura-para-ecommerce}")
    private String secretKey;
    
    // Verificar que el secreto se haya cargado correctamente al iniciar
    @PostConstruct
    public void init() {
        if (secretKey == null || secretKey.isEmpty()) {
            System.err.println("ERROR CRÍTICO: JWT_SECRET no está configurado!");
            System.err.println("Por favor, verifica que la variable de entorno JWT_SECRET esté configurada en docker-compose.yml");
        } else {
            System.out.println("JwtService inicializado correctamente");
            System.out.println("JwtService - Secret preview: " + getSecretKeyPreview());
            System.out.println("JwtService - Secret length: " + secretKey.length() + " caracteres");
            // Verificar que sea el secreto correcto
            if (!secretKey.equals("mi-clave-secreta-jwt-muy-segura-para-ecommerce")) {
                System.err.println("ADVERTENCIA: El secreto JWT no coincide con el esperado!");
                System.err.println("Esperado: mi-clave-secreta-jwt-muy-segura-para-ecommerce");
                System.err.println("Actual: " + getSecretKeyPreview());
            } else {
                System.out.println("JwtService - Secreto JWT verificado correctamente");
            }
        }
    }

    // Crear la clave de firma para HS256
    // IMPORTANTE: PHP Firebase JWT usa hash_hmac('SHA256', $data, $secret) directamente
    // con el string del secreto. Para compatibilidad, usamos SecretKeySpec directamente
    // que procesa el secreto de la misma manera que PHP
    private SecretKey getSigningKey() {
        if (secretKey == null || secretKey.isEmpty()) {
            throw new RuntimeException("JWT secret key no está configurado");
        }
        
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        
        // Usar SecretKeySpec directamente para máxima compatibilidad con PHP Firebase JWT
        // PHP usa hash_hmac('SHA256', ...) que acepta claves de cualquier longitud
        // SecretKeySpec hace lo mismo en Java
        return new SecretKeySpec(keyBytes, "HmacSHA256");
    }
    
    // Método para verificar que el secreto esté configurado correctamente
    public String getSecretKeyPreview() {
        if (secretKey == null || secretKey.isEmpty()) {
            return "SECRET_KEY_NOT_SET";
        }
        // Mostrar solo los primeros y últimos caracteres para seguridad
        int length = secretKey.length();
        if (length <= 10) {
            return "***";
        }
        return secretKey.substring(0, 5) + "..." + secretKey.substring(length - 5);
    }

    public void validateToken(String token) {
        try {
            // Log para debugging (solo en desarrollo)
            System.out.println("JwtService - Validando token. Secret preview: " + getSecretKeyPreview());
            System.out.println("JwtService - Secret length: " + (secretKey != null ? secretKey.length() : 0) + " caracteres");
            System.out.println("JwtService - Token preview: " + (token != null && token.length() > 20 
                ? token.substring(0, 20) + "..." : "null"));
            
            // Validar el token usando SecretKeySpec (compatible con PHP)
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            
            System.out.println("JwtService - Token validado exitosamente");
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            System.err.println("JwtService - Token expirado: " + e.getMessage());
            throw new RuntimeException("JWT expirado: " + e.getMessage());
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            System.err.println("JwtService - Token malformado: " + e.getMessage());
            throw new RuntimeException("JWT malformado: " + e.getMessage());
        } catch (io.jsonwebtoken.security.SignatureException e) {
            System.err.println("JwtService - Firma invalida. Secret usado: " + getSecretKeyPreview());
            System.err.println("JwtService - Secret completo (para debug): [" + secretKey + "]");
            System.err.println("JwtService - Secret bytes length: " + secretKey.getBytes(StandardCharsets.UTF_8).length);
            System.err.println("JwtService - Error: " + e.getMessage());
            throw new RuntimeException("Firma JWT invalida. Verifica que el secreto sea correcto. Secret usado: " + getSecretKeyPreview() + " - Error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("JwtService - Error general: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("JWT invalido o expirado: " + e.getMessage());
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
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
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
