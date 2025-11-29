package com.example.payment_service.service;

import com.example.payment_service.dto.CouponValidationRequest;
import com.example.payment_service.dto.CouponValidationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Service
public class CouponService {

    private static final Logger logger = LoggerFactory.getLogger(CouponService.class);

    @Value("${catalog.service.url:http://localhost:8000}")
    private String catalogServiceUrl;

    private final RestTemplate restTemplate;

    public CouponService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Valida un cupón llamando al catalog-service
     */
    public CouponValidationResponse validateCoupon(String couponCode, BigDecimal total, Long userId) {
        try {
            String url = catalogServiceUrl + "/api/cupones/validate/";

            // Crear request
            CouponValidationRequest request = new CouponValidationRequest(
                    couponCode.toUpperCase().trim(),
                    total,
                    userId);

            // Configurar headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<CouponValidationRequest> entity = new HttpEntity<>(request, headers);

            // Llamar al servicio
            logger.info("Validando cupón '{}' con catalog-service: {}", couponCode, url);

            ResponseEntity<CouponValidationResponse> response = restTemplate.postForEntity(
                    url,
                    entity,
                    CouponValidationResponse.class);

            CouponValidationResponse validationResponse = response.getBody();

            if (validationResponse != null) {
                logger.info("Respuesta de validación: valid={}, discount={}, message={}",
                        validationResponse.isValid(),
                        validationResponse.getDiscount(),
                        validationResponse.getMessage());
                return validationResponse;
            } else {
                logger.error("Respuesta vacía del catalog-service");
                return createErrorResponse("Error al validar cupón: respuesta vacía");
            }

        } catch (Exception e) {
            logger.error("Error al validar cupón con catalog-service", e);
            return createErrorResponse("Error al validar cupón: " + e.getMessage());
        }
    }

    /**
     * Registra el uso de un cupón después de completar la compra
     */
    public void registerCouponUsage(String couponCode, Long userId, Long orderId,
            BigDecimal discountAmount, BigDecimal originalAmount) {
        try {
            String url = catalogServiceUrl + "/api/cupones/register-use/";

            // Crear body
            var requestBody = new java.util.HashMap<String, Object>();
            requestBody.put("codigo", couponCode);
            requestBody.put("usuario_id", userId);
            requestBody.put("order_id", orderId);
            requestBody.put("monto_descuento", discountAmount);
            requestBody.put("monto_original", originalAmount);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);

            logger.info("Registrando uso de cupón '{}' para orden {}", couponCode, orderId);

            restTemplate.postForEntity(url, entity, Object.class);

            logger.info("Uso de cupón registrado exitosamente");

        } catch (Exception e) {
            logger.error("Error al registrar uso de cupón (no crítico, continuando...)", e);
            // No lanzar excepción, solo logear, ya que la orden ya fue creada
        }
    }

    private CouponValidationResponse createErrorResponse(String message) {
        return new CouponValidationResponse(false, message, BigDecimal.ZERO);
    }
}
