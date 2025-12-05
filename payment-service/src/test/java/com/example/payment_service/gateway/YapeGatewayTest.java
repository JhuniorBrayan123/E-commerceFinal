package com.example.payment_service.gateway;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.RefundRequest;
import com.example.payment_service.exception.PaymentException;
import com.example.payment_service.model.Payment;

@ExtendWith(MockitoExtension.class)
class YapeGatewayTest {

    private YapeGateway yapeGateway;
    private WebClient.Builder webClientBuilder;

    @BeforeEach
    void setUp() {
        webClientBuilder = mock(WebClient.Builder.class);
        WebClient webClient = mock(WebClient.class);

        when(webClientBuilder.baseUrl(anyString())).thenReturn(webClientBuilder);
        when(webClientBuilder.build()).thenReturn(webClient);

        yapeGateway = new YapeGateway(
                webClientBuilder,
                "https://api.yape.com.pe/v1",
                0 // sin delay para pruebas
        );
    }

    /**
     * Test #25: processPayment() debe retornar PaymentResponse exitoso con monto
     * válido
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar el monto de "200.00" a "3500.00" en createPaymentRequest
     * - El test fallará porque excederá el límite de Yape (3000 soles)
     */
    @Test
    @DisplayName("Test #25: processPayment() debe retornar PaymentResponse exitoso con monto válido")
    void processPayment_WithValidAmount_ReturnsSuccessfulResponse() {
        System.out.println("Test #25: processPayment() debe retornar PaymentResponse exitoso con monto válido");

        // Given
        PaymentRequest request = createPaymentRequest("200.00", Payment.Currency.PEN, 123L);

        // When
        PaymentResponse response = yapeGateway.processPayment(request);

        // Then
        assertNotNull(response);
        assertEquals("PAID", response.getStatus());
        assertEquals(new BigDecimal("200.00"), response.getAmount());
        assertEquals("yape", response.getGateway());
        assertTrue(response.getTransactionId().startsWith("yape_tx_"));
    }

    /**
     * Test #26: processPayment() debe lanzar PaymentException si monto > 3000
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar el monto de "3001.00" a "2999.00"
     * - El test fallará porque el monto estará dentro del límite y no lanzará
     * excepción
     */
    @Test
    @DisplayName("Test #26: processPayment() debe lanzar PaymentException si monto > 3000")
    void processPayment_WithAmountGreaterThan3000_ThrowsPaymentException() {
        System.out.println("Test #26: processPayment() debe lanzar PaymentException si monto > 3000");

        // Given
        PaymentRequest request = createPaymentRequest("3001.00", Payment.Currency.PEN, 123L);

        // When & Then
        PaymentException exception = assertThrows(PaymentException.class,
                () -> yapeGateway.processPayment(request));

        assertEquals("YAPE_LIMIT", exception.getErrorCode());
        assertEquals("El monto excede el limite diario de Yape", exception.getMessage());
    }

    /**
     * Test #27: processPayment() debe generar transactionId con prefijo 'yape_tx_'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar startsWith("yape_tx_") a startsWith("stripe_tx_")
     * - El test fallará porque el prefijo no coincidirá
     */
    @Test
    @DisplayName("Test #27: processPayment() debe generar transactionId con prefijo 'yape_tx_'")
    void processPayment_GeneratesTransactionIdWithCorrectPrefix() {
        System.out.println("Test #27: processPayment() debe generar transactionId con prefijo 'yape_tx_'");

        // Given
        PaymentRequest request = createPaymentRequest("50.00", Payment.Currency.PEN, 123L);

        // When
        PaymentResponse response = yapeGateway.processPayment(request);

        // Then
        assertNotNull(response.getTransactionId());
        assertTrue(response.getTransactionId().startsWith("yape_tx_"));
    }

    /**
     * Test #28: processPayment() con monto exacto 3000 debe ser exitoso
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar el monto a "3000.01"
     * - El test fallará porque excederá el límite
     */
    @Test
    @DisplayName("Test #28: processPayment() con monto exacto 3000 debe ser exitoso")
    void processPayment_WithAmountExactly3000_ReturnsSuccessfulResponse() {
        System.out.println("Test #28: processPayment() con monto exacto 3000 debe ser exitoso");

        // Given
        PaymentRequest request = createPaymentRequest("3000.00", Payment.Currency.PEN, 123L);

        // When
        PaymentResponse response = yapeGateway.processPayment(request);

        // Then
        assertNotNull(response);
        assertEquals("PAID", response.getStatus());
        assertEquals(new BigDecimal("3000.00"), response.getAmount());
    }

    /**
     * Test #29: processRefund() debe retornar PaymentResponse con status REFUNDED
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("REFUNDED", ...) a assertEquals("PAID", ...)
     * - El test fallará porque el status esperado no coincidirá
     */
    @Test
    @DisplayName("Test #29: processRefund() debe retornar PaymentResponse con status REFUNDED")
    void processRefund_ReturnsRefundedResponse() {
        System.out.println("Test #29: processRefund() debe retornar PaymentResponse con status REFUNDED");

        // Given
        RefundRequest request = createRefundRequest("100.00");

        // When
        PaymentResponse response = yapeGateway.processRefund(request);

        // Then
        assertNotNull(response);
        assertEquals("REFUNDED", response.getStatus());
        assertEquals(new BigDecimal("100.00"), response.getAmount());
        assertEquals("yape", response.getGateway());
    }

    /**
     * Test #30: processRefund() debe generar transactionId con prefijo
     * 'yape_refund_'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar startsWith("yape_refund_") a startsWith("yape_tx_")
     * - El test fallará porque el prefijo no coincidirá
     */
    @Test
    @DisplayName("Test #30: processRefund() debe generar transactionId con prefijo 'yape_refund_'")
    void processRefund_GeneratesTransactionIdWithCorrectPrefix() {
        System.out.println("Test #30: processRefund() debe generar transactionId con prefijo 'yape_refund_'");

        // Given
        RefundRequest request = createRefundRequest("100.00");

        // When
        PaymentResponse response = yapeGateway.processRefund(request);

        // Then
        assertNotNull(response.getTransactionId());
        assertTrue(response.getTransactionId().startsWith("yape_refund_"));
    }

    /**
     * Test #31: validateWebhook() debe retornar true si signature empieza con
     * 'yape_whsec_'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar la signature de "yape_whsec_xyz789abc123" a "invalid_signature"
     * - El test fallará porque la signature no empezará con el prefijo correcto
     */
    @Test
    @DisplayName("Test #31: validateWebhook() debe retornar true si signature empieza con 'yape_whsec_'")
    void validateWebhook_WithValidSignature_ReturnsTrue() {
        System.out.println("Test #31: validateWebhook() debe retornar true si signature empieza con 'yape_whsec_'");

        // Given
        String payload = "{\"event\": \"payment.succeeded\"}";
        String signature = "yape_whsec_xyz789abc123";

        // When
        boolean isValid = yapeGateway.validateWebhook(payload, signature);

        // Then
        assertTrue(isValid);
    }

    /**
     * Test #32: validateWebhook() debe retornar false si signature es null
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertFalse(isValid) a assertTrue(isValid)
     * - El test fallará porque isValid será false
     */
    @Test
    @DisplayName("Test #32: validateWebhook() debe retornar false si signature es null")
    void validateWebhook_WithNullSignature_ReturnsFalse() {
        System.out.println("Test #32: validateWebhook() debe retornar false si signature es null");

        // Given
        String payload = "{\"event\": \"payment.succeeded\"}";
        String signature = null;

        // When
        boolean isValid = yapeGateway.validateWebhook(payload, signature);

        // Then
        assertFalse(isValid);
    }

    /**
     * Test #33: validateWebhook() debe retornar false si signature no empieza con
     * 'yape_whsec_'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar la signature a "yape_whsec_valid"
     * - El test fallará porque la signature será válida
     */
    @Test
    @DisplayName("Test #33: validateWebhook() debe retornar false si signature no empieza con 'yape_whsec_'")
    void validateWebhook_WithInvalidSignature_ReturnsFalse() {
        System.out.println("Test #33: validateWebhook() debe retornar false si signature no empieza con 'yape_whsec_'");

        // Given
        String payload = "{\"event\": \"payment.succeeded\"}";
        String signature = "invalid_signature";

        // When
        boolean isValid = yapeGateway.validateWebhook(payload, signature);

        // Then
        assertFalse(isValid);
    }

    /**
     * Test #34: getGatewayName() debe retornar 'yape'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("yape", ...) a assertEquals("stripe", ...)
     * - El test fallará porque el nombre del gateway no coincidirá
     */
    @Test
    @DisplayName("Test #34: getGatewayName() debe retornar 'yape'")
    void getGatewayName_ReturnsYape() {
        System.out.println("Test #34: getGatewayName() debe retornar 'yape'");

        // When
        String gatewayName = yapeGateway.getGatewayName();

        // Then
        assertEquals("yape", gatewayName);
    }

    /**
     * Test #35: processPayment() con monto negativo debe ser exitoso (si la
     * validación lo permite)
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("PAID", ...) a assertEquals("FAILED", ...)
     * - El test fallará porque el status esperado no coincidirá
     */
    @Test
    @DisplayName("Test #35: processPayment() con monto negativo debe ser exitoso (si la validación lo permite)")
    void processPayment_WithNegativeAmount_ReturnsSuccessfulResponse() {
        System.out.println("Test #35: processPayment() con monto negativo debe ser exitoso");

        // Given
        PaymentRequest request = createPaymentRequest("-100.00", Payment.Currency.PEN, 123L);

        // When
        PaymentResponse response = yapeGateway.processPayment(request);

        // Then
        assertNotNull(response);
        assertEquals("PAID", response.getStatus());
        assertEquals(new BigDecimal("-100.00"), response.getAmount());
    }

    // Métodos helper para crear objetos de prueba
    private PaymentRequest createPaymentRequest(String amount, Payment.Currency currency, Long orderId) {
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal(amount));
        request.setCurrency(currency);
        request.setOrderId(orderId);
        request.setPaymentMethod(Payment.PaymentMethod.YAPE);
        request.setItems(java.util.Collections.emptyList()); // Lista vacía para los tests
        return request;
    }

    private RefundRequest createRefundRequest(String amount) {
        RefundRequest request = new RefundRequest();
        request.setAmount(new BigDecimal(amount));
        return request;
    }
}
