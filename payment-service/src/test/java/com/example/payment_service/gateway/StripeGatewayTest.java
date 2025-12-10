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
class StripeGatewayTest {

    private StripeGateway stripeGateway;
    private WebClient.Builder webClientBuilder;

    @BeforeEach
    void setUp() {
        webClientBuilder = mock(WebClient.Builder.class);
        WebClient webClient = mock(WebClient.class);

        when(webClientBuilder.baseUrl(anyString())).thenReturn(webClientBuilder);
        when(webClientBuilder.build()).thenReturn(webClient);

        stripeGateway = new StripeGateway(
                webClientBuilder,
                "https://api.stripe.com/v1",
                0 // Sin delay para pruebas
        );
    }

    /**
     * Test #36: processPayment() debe retornar PaymentResponse exitoso con monto
     * válido
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar el monto de "100.00" a "5001.00" en createPaymentRequest
     * - El test fallará porque excederá el límite de Stripe (5000)
     */
    @Test
    @DisplayName("Test #36: processPayment() debe retornar PaymentResponse exitoso con monto válido")
    void processPayment_WithValidAmount_ReturnsSuccessfulResponse() {
        System.out.println("Test #36: processPayment() debe retornar PaymentResponse exitoso con monto válido");

        // Given
        PaymentRequest request = createPaymentRequest("100.00", Payment.Currency.USD, 123L);

        // When
        PaymentResponse response = stripeGateway.processPayment(request);

        // Then
        assertNotNull(response, "❌ Test #36 FALLÓ: response no debe ser null");
        assertEquals("PAID", response.getStatus(), "❌ Test #36 FALLÓ: status debe ser PAID");
        assertEquals(new BigDecimal("100.00"), response.getAmount(), "❌ Test #36 FALLÓ: amount debe ser 100.00");
        assertEquals("stripe", response.getGateway(), "❌ Test #36 FALLÓ: gateway debe ser stripe");
        assertTrue(response.getTransactionId().startsWith("stripe_tx_"), "❌ Test #36 FALLÓ: transactionId debe empezar con stripe_tx_");
    }

    /**
     * Test #37: processPayment() debe lanzar PaymentException si monto > 5000
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar el monto de "5000.01" a "4999.00"
     * - El test fallará porque el monto estará dentro del límite
     */
    @Test
    @DisplayName("Test #37: processPayment() debe lanzar PaymentException si monto > 5000")
    void processPayment_WithAmountGreaterThan5000_ThrowsPaymentException() {
        System.out.println("Test #37: processPayment() debe lanzar PaymentException si monto > 5000");

        // Given
        PaymentRequest request = createPaymentRequest("5000.01", Payment.Currency.USD, 123L);

        // When & Then
        PaymentException exception = assertThrows(PaymentException.class,
                () -> stripeGateway.processPayment(request),
                "❌ Test #37 FALLÓ: no lanzó la excepción esperada");

        assertEquals("STRIPE_LIMIT", exception.getErrorCode(), "❌ Test #37 FALLÓ: errorCode debe ser STRIPE_LIMIT");
        assertEquals("Stripe rechazo el monto solicitado", exception.getMessage(), "❌ Test #37 FALLÓ: mensaje de excepción incorrecto");
    }

    /**
     * Test #38: processPayment() debe generar transactionId con prefijo
     * 'stripe_tx_'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar startsWith("stripe_tx_") a startsWith("yape_tx_")
     * - El test fallará porque el prefijo no coincidirá
     */
    @Test
    @DisplayName("Test #38: processPayment() debe generar transactionId con prefijo 'stripe_tx_'")
    void processPayment_GeneratesTransactionIdWithCorrectPrefix() {
        System.out.println("Test #38: processPayment() debe generar transactionId con prefijo 'stripe_tx_'");

        // Given
        PaymentRequest request = createPaymentRequest("50.00", Payment.Currency.USD, 123L);

        // When
        PaymentResponse response = stripeGateway.processPayment(request);

        // Then
        assertNotNull(response.getTransactionId(), "❌ Test #38 FALLÓ: transactionId no debe ser null");
        assertTrue(response.getTransactionId().startsWith("stripe_tx_"), "❌ Test #38 FALLÓ: transactionId debe empezar con stripe_tx_");
    }

    /**
     * Test #39: processPayment() con monto exacto 5000 debe ser exitoso
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("PAID", ...) a assertEquals("FAILED", ...)
     * - El test fallará porque el status esperado no coincidirá
     */
    @Test
    @DisplayName("Test #39: processPayment() con monto exacto 5000 debe ser exitoso")
    void processPayment_WithAmountExactly5000_ReturnsSuccessfulResponse() {
        System.out.println("Test #39: processPayment() con monto exacto 5000 debe ser exitoso");

        // Given
        PaymentRequest request = createPaymentRequest("5000.00", Payment.Currency.USD, 123L);

        // When
        PaymentResponse response = stripeGateway.processPayment(request);

        // Then
        assertNotNull(response, "❌ Test #39 FALLÓ: response no debe ser null");
        assertEquals("PAID", response.getStatus(), "❌ Test #39 FALLÓ: status debe ser PAID");
        assertEquals(new BigDecimal("5000.00"), response.getAmount(), "❌ Test #39 FALLÓ: amount debe ser 5000.00");
    }

    /**
     * Test #40: processRefund() debe retornar PaymentResponse con status REFUNDED
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("REFUNDED", ...) a assertEquals("PAID", ...)
     * - El test fallará porque el status esperado no coincidirá
     */
    @Test
    @DisplayName("Test #40: processRefund() debe retornar PaymentResponse con status REFUNDED")
    void processRefund_ReturnsRefundedResponse() {
        System.out.println("Test #40: processRefund() debe retornar PaymentResponse con status REFUNDED");

        // Given
        RefundRequest request = createRefundRequest("100.00");

        // When
        PaymentResponse response = stripeGateway.processRefund(request);

        // Then
        assertNotNull(response, "❌ Test #40 FALLÓ: response no debe ser null");
        assertEquals("REFUNDED", response.getStatus(), "❌ Test #40 FALLÓ: status debe ser REFUNDED");
        assertEquals(new BigDecimal("100.00"), response.getAmount(), "❌ Test #40 FALLÓ: amount debe ser 100.00");
        assertEquals("stripe", response.getGateway(), "❌ Test #40 FALLÓ: gateway debe ser stripe");
    }

    /**
     * Test #41: processRefund() debe generar transactionId con prefijo
     * 'stripe_refund_'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar startsWith("stripe_refund_") a startsWith("stripe_tx_")
     * - El test fallará porque el prefijo no coincidirá
     */
    @Test
    @DisplayName("Test #41: processRefund() debe generar transactionId con prefijo 'stripe_refund_'")
    void processRefund_GeneratesTransactionIdWithCorrectPrefix() {
        System.out.println("Test #41: processRefund() debe generar transactionId con prefijo 'stripe_refund_'");

        // Given
        RefundRequest request = createRefundRequest("100.00");

        // When
        PaymentResponse response = stripeGateway.processRefund(request);

        // Then
        assertNotNull(response.getTransactionId(), "❌ Test #41 FALLÓ: transactionId no debe ser null");
        assertTrue(response.getTransactionId().startsWith("stripe_refund_"), "❌ Test #41 FALLÓ: transactionId debe empezar con stripe_refund_");
    }

    /**
     * Test #42: validateWebhook() debe retornar true si signature empieza con
     * 'whsec'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar la signature de "whsec_abc123def456" a "invalid"
     * - El test fallará porque la signature no empezará con 'whsec'
     */
    @Test
    @DisplayName("Test #42: validateWebhook() debe retornar true si signature empieza con 'whsec'")
    void validateWebhook_WithValidSignature_ReturnsTrue() {
        System.out.println("Test #42: validateWebhook() debe retornar true si signature empieza con 'whsec'");

        // Given
        String payload = "{\"event\": \"payment.succeeded\"}";
        String signature = "whsec_abc123def456";

        // When
        boolean isValid = stripeGateway.validateWebhook(payload, signature);

        // Then
        assertTrue(isValid, "❌ Test #42 FALLÓ: validateWebhook debe retornar true con signature válida");
    }

    /**
     * Test #43: validateWebhook() debe retornar false si signature es null
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertFalse(isValid) a assertTrue(isValid)
     * - El test fallará porque espera false cuando signature es null
     */
    @Test
    @DisplayName("Test #43: validateWebhook() debe retornar false si signature es null")
    void validateWebhook_WithNullSignature_ReturnsFalse() {
        System.out.println("Test #43: validateWebhook() debe retornar false si signature es null");

        // Given
        String payload = "{\"event\": \"payment.succeeded\"}";
        String signature = null;

        // When
        boolean isValid = stripeGateway.validateWebhook(payload, signature);

        // Then
        assertFalse(isValid);
    }

    /**
     * Test #44: validateWebhook() debe retornar false si signature no empieza con
     * 'whsec'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar la signature de "invalid_signature" a "whsec_valid"
     * - El test fallará porque la signature será válida
     */
    @Test
    @DisplayName("Test #44: validateWebhook() debe retornar false si signature no empieza con 'whsec'")
    void validateWebhook_WithInvalidSignature_ReturnsFalse() {
        System.out.println("Test #44: validateWebhook() debe retornar false si signature no empieza con 'whsec'");

        // Given
        String payload = "{\"event\": \"payment.succeeded\"}";
        String signature = "invalid_signature";

        // When
        boolean isValid = stripeGateway.validateWebhook(payload, signature);

        // Then
        assertFalse(isValid, "❌ Test #44 FALLÓ: validateWebhook debe retornar false cuando signature no empieza con whsec");
    }

    /**
     * Test #45: validateWebhook() debe retornar false si signature está vacía
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertFalse(isValid) a assertTrue(isValid)
     * - El test fallará porque espera false cuando signature está vacía
     */
    @Test
    @DisplayName("Test #45: validateWebhook() debe retornar false si signature está vacía")
    void validateWebhook_WithEmptySignature_ReturnsFalse() {
        System.out.println("Test #45: validateWebhook() debe retornar false si signature está vacía");

        // Given
        String payload = "{\"event\": \"payment.succeeded\"}";
        String signature = "";

        // When
        boolean isValid = stripeGateway.validateWebhook(payload, signature);

        // Then
        assertFalse(isValid, "❌ Test #45 FALLÓ: validateWebhook debe retornar false cuando signature está vacía");
    }

    /**
     * Test #46: getGatewayName() debe retornar 'stripe'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("stripe", ...) a assertEquals("yape", ...)
     * - El test fallará porque el gateway name esperado no coincidirá
     */
    @Test
    @DisplayName("Test #46: getGatewayName() debe retornar 'stripe'")
    void getGatewayName_ReturnsStripe() {
        System.out.println("Test #46: getGatewayName() debe retornar 'stripe'");

        // When
        String gatewayName = stripeGateway.getGatewayName();

        // Then
        assertEquals("stripe", gatewayName, "❌ Test #46 FALLÓ: gatewayName debe ser stripe");
    }

    /**
     * Test #47: processPayment con monto negativo debe ser exitoso (si la
     * validación lo permite)
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("PAID", ...) a assertEquals("FAILED", ...)
     * - El test fallará porque el status esperado no coincidirá
     */
    @Test
    @DisplayName("Test #47: processPayment con monto negativo debe ser exitoso (si la validación lo permite)")
    void processPayment_WithNegativeAmount_ReturnsSuccessfulResponse() {
        System.out.println("Test #47: processPayment con monto negativo debe ser exitoso");

        // Given
        PaymentRequest request = createPaymentRequest("-100.00", Payment.Currency.USD, 123L);

        // When
        PaymentResponse response = stripeGateway.processPayment(request);

        // Then
        assertNotNull(response, "❌ Test #47 FALLÓ: response no debe ser null");
        assertEquals("PAID", response.getStatus(), "❌ Test #47 FALLÓ: status debe ser PAID");
        assertEquals(new BigDecimal("-100.00"), response.getAmount(), "❌ Test #47 FALLÓ: amount debe ser -100.00");
    }

    /**
     * Test #48: processPayment con currency PEN debe ser exitoso
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * -Cambiar assertEquals(Payment.Currency.PEN, ...) a
     * assertEquals(Payment.Currency.USD, ...)
     * - El test fallará porque la currency esperada no coincidirá
     */
    @Test
    @DisplayName("Test #48: processPayment con currency PEN debe ser exitoso")
    void processPayment_WithCurrencyPEN_ReturnsSuccessfulResponse() {
        System.out.println("Test #48: processPayment con currency PEN debe ser exitoso");

        // Given
        PaymentRequest request = createPaymentRequest("100.00", Payment.Currency.PEN, 123L);

        // When
        PaymentResponse response = stripeGateway.processPayment(request);

        // Then
        assertNotNull(response, "❌ Test #48 FALLÓ: response no debe ser null");
        assertEquals("PAID", response.getStatus(), "❌ Test #48 FALLÓ: status debe ser PAID");
        assertEquals(new BigDecimal("100.00"), response.getAmount(), "❌ Test #48 FALLÓ: amount debe ser 100.00");
        assertEquals(Payment.Currency.PEN, request.getCurrency(), "❌ Test #48 FALLÓ: currency debe ser PEN");
    }

    // Métodos helper para crear objetos de prueba
    private PaymentRequest createPaymentRequest(String amount, Payment.Currency currency, Long orderId) {
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal(amount));
        request.setCurrency(currency);
        request.setOrderId(orderId);
        return request;
    }

    private RefundRequest createRefundRequest(String amount) {
        RefundRequest request = new RefundRequest();
        request.setAmount(new BigDecimal(amount));
        // No necesitamos setTransactionId si RefundRequest no tiene ese campo
        // o si se usa de forma diferente en tu implementación
        return request;
    }
}
