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

    @Test
    @DisplayName("processPayment() debe retornar PaymentResponse exitoso con monto válido")
    void processPayment_WithValidAmount_ReturnsSuccessfulResponse() {
        // Given
        PaymentRequest request = createPaymentRequest("100.00", Payment.Currency.USD, 123L);

        // When
        PaymentResponse response = stripeGateway.processPayment(request);

        // Then
        assertNotNull(response);
        assertEquals("PAID", response.getStatus());
        assertEquals(new BigDecimal("100.00"), response.getAmount());
        assertEquals("stripe", response.getGateway());
        assertTrue(response.getTransactionId().startsWith("stripe_tx_"));
    }

    @Test
    @DisplayName("processPayment() debe lanzar PaymentException si monto > 5000")
    void processPayment_WithAmountGreaterThan5000_ThrowsPaymentException() {
        // Given
        PaymentRequest request = createPaymentRequest("5000.01", Payment.Currency.USD, 123L);

        // When & Then
        PaymentException exception = assertThrows(PaymentException.class,
                () -> stripeGateway.processPayment(request));

        assertEquals("STRIPE_LIMIT", exception.getErrorCode());
        assertEquals("Stripe rechazo el monto solicitado", exception.getMessage());
    }

    @Test
    @DisplayName("processPayment() debe generar transactionId con prefijo 'stripe_tx_'")
    void processPayment_GeneratesTransactionIdWithCorrectPrefix() {
        // Given
        PaymentRequest request = createPaymentRequest("50.00", Payment.Currency.USD, 123L);

        // When
        PaymentResponse response = stripeGateway.processPayment(request);

        // Then
        assertNotNull(response.getTransactionId());
        assertTrue(response.getTransactionId().startsWith("stripe_tx_"));
    }

    @Test
    @DisplayName("processPayment() con monto exacto 5000 debe ser exitoso")
    void processPayment_WithAmountExactly5000_ReturnsSuccessfulResponse() {
        // Given
        PaymentRequest request = createPaymentRequest("5000.00", Payment.Currency.USD, 123L);

        // When
        PaymentResponse response = stripeGateway.processPayment(request);

        // Then
        assertNotNull(response);
        assertEquals("PAID", response.getStatus());
        assertEquals(new BigDecimal("5000.00"), response.getAmount());
    }

    @Test
    @DisplayName("processRefund() debe retornar PaymentResponse con status REFUNDED")
    void processRefund_ReturnsRefundedResponse() {
        // Given
        RefundRequest request = createRefundRequest("100.00");

        // When
        PaymentResponse response = stripeGateway.processRefund(request);

        // Then
        assertNotNull(response);
        assertEquals("REFUNDED", response.getStatus());
        assertEquals(new BigDecimal("100.00"), response.getAmount());
        assertEquals("stripe", response.getGateway());
    }

    @Test
    @DisplayName("processRefund() debe generar transactionId con prefijo 'stripe_refund_'")
    void processRefund_GeneratesTransactionIdWithCorrectPrefix() {
        // Given
        RefundRequest request = createRefundRequest("100.00");

        // When
        PaymentResponse response = stripeGateway.processRefund(request);

        // Then
        assertNotNull(response.getTransactionId());
        assertTrue(response.getTransactionId().startsWith("stripe_refund_"));
    }

    @Test
    @DisplayName("validateWebhook() debe retornar true si signature empieza con 'whsec'")
    void validateWebhook_WithValidSignature_ReturnsTrue() {
        // Given
        String payload = "{\"event\": \"payment.succeeded\"}";
        String signature = "whsec_abc123def456";

        // When
        boolean isValid = stripeGateway.validateWebhook(payload, signature);

        // Then
        assertTrue(isValid);
    }

    @Test
    @DisplayName("validateWebhook() debe retornar false si signature es null")
    void validateWebhook_WithNullSignature_ReturnsFalse() {
        // Given
        String payload = "{\"event\": \"payment.succeeded\"}";
        String signature = null;

        // When
        boolean isValid = stripeGateway.validateWebhook(payload, signature);

        // Then
        assertFalse(isValid);
    }

    @Test
    @DisplayName("validateWebhook() debe retornar false si signature no empieza con 'whsec'")
    void validateWebhook_WithInvalidSignature_ReturnsFalse() {
        // Given
        String payload = "{\"event\": \"payment.succeeded\"}";
        String signature = "invalid_signature";

        // When
        boolean isValid = stripeGateway.validateWebhook(payload, signature);

        // Then
        assertFalse(isValid);
    }

    @Test
    @DisplayName("validateWebhook() debe retornar false si signature está vacía")
    void validateWebhook_WithEmptySignature_ReturnsFalse() {
        // Given
        String payload = "{\"event\": \"payment.succeeded\"}";
        String signature = "";

        // When
        boolean isValid = stripeGateway.validateWebhook(payload, signature);

        // Then
        assertFalse(isValid);
    }

    @Test
    @DisplayName("getGatewayName() debe retornar 'stripe'")
    void getGatewayName_ReturnsStripe() {
        // When
        String gatewayName = stripeGateway.getGatewayName();

        // Then
        assertEquals("stripe", gatewayName);
    }

    @Test
    @DisplayName("processPayment con monto negativo debe ser exitoso (si la validación lo permite)")
    void processPayment_WithNegativeAmount_ReturnsSuccessfulResponse() {
        // Given
        PaymentRequest request = createPaymentRequest("-100.00", Payment.Currency.USD, 123L);

        // When
        PaymentResponse response = stripeGateway.processPayment(request);

        // Then
        assertNotNull(response);
        assertEquals("PAID", response.getStatus());
        assertEquals(new BigDecimal("-100.00"), response.getAmount());
    }

    @Test
    @DisplayName("processPayment con currency PEN debe ser exitoso")
    void processPayment_WithCurrencyPEN_ReturnsSuccessfulResponse() {
        // Given
        PaymentRequest request = createPaymentRequest("100.00", Payment.Currency.PEN, 123L);

        // When
        PaymentResponse response = stripeGateway.processPayment(request);

        // Then
        assertNotNull(response);
        assertEquals("PAID", response.getStatus());
        assertEquals(new BigDecimal("100.00"), response.getAmount());
        assertEquals(Payment.Currency.PEN, request.getCurrency());
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
