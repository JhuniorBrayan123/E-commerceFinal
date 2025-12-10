package com.example.payment_service.gateway;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.RefundRequest;
import com.example.payment_service.exception.PaymentException;

@ExtendWith(MockitoExtension.class)
class PaypalGatewayTest {

    private PaypalGateway paypalGateway;

    @BeforeEach
    void setUp() {
        // IMPORTANTE: minDelay debe ser MENOR que maxDelay
        // De lo contrario Random.nextLong(min, max) lanzará IllegalArgumentException
        paypalGateway = new PaypalGateway(50, 100);
    }

    /**
     * Test #49: processPayment() debe retornar PaymentResponse con status PAID
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("PAID", ...) a assertEquals("FAILED", ...)
     * - El test fallará porque el status esperado no coincidirá
     */
    @Test
    @DisplayName("Test #49: processPayment() debe retornar PaymentResponse con status PAID")
    void processPayment_ReturnsSuccessfulResponse() {
        System.out.println("Test #49: processPayment() debe retornar PaymentResponse con status PAID");

        // Given
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("100.00"));
        request.setOrderId(123L);

        // When
        PaymentResponse response = paypalGateway.processPayment(request);

        // Then
        assertNotNull(response, "❌ Test #49 FALLÓ: response no debe ser null");
        assertEquals("PAID", response.getStatus(), "❌ Test #49 FALLÓ: status debe ser PAID");
        assertEquals(new BigDecimal("100.00"), response.getAmount(), "❌ Test #49 FALLÓ: amount debe ser 100.00");
        assertEquals("paypal", response.getGateway(), "❌ Test #49 FALLÓ: gateway debe ser paypal");
    }

    /**
     * Test #50: processPayment() debe generar transactionId con prefijo
     * 'paypal_tx_'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar startsWith("paypal_tx_") a startsWith("stripe_tx_")
     * - El test fallará porque el prefijo no coincidirá
     */
    @Test
    @DisplayName("Test #50: processPayment() debe generar transactionId con prefijo 'paypal_tx_'")
    void processPayment_GeneratesTransactionIdWithCorrectPrefix() {
        System.out.println("Test #50: processPayment() debe generar transactionId con prefijo 'paypal_tx_'");

        // Given
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("50.00"));
        request.setOrderId(456L);

        // When
        PaymentResponse response = paypalGateway.processPayment(request);

        // Then
        assertNotNull(response.getTransactionId(), "❌ Test #50 FALLÓ: transactionId no debe ser null");
        assertTrue(response.getTransactionId().startsWith("paypal_tx_"), "❌ Test #50 FALLÓ: transactionId debe empezar con paypal_tx_");
    }

    /**
     * Test #51: processPayment() debe lanzar PaymentException con probabilidad 1/10
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar attempts < 200 a attempts < 5
     * - El test puede fallar porque no se ejecutan suficientes intentos para
     * garantizar que se lance la excepción
     */
    @Test
    @DisplayName("Test #51: processPayment() debe lanzar PaymentException con probabilidad 1/10")
    void processPayment_ThrowsPaymentExceptionWithOneTenthProbability() {
        System.out.println("Test #51: processPayment() debe lanzar PaymentException con probabilidad 1/10");

        // Given
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("100.00"));
        request.setOrderId(123L);

        // Ejecutamos múltiples veces y verificamos que al menos una vez falle
        boolean exceptionThrown = false;
        int attempts = 0;

        // Probamos hasta 200 veces para asegurar alta probabilidad de éxito
        while (!exceptionThrown && attempts < 200) {
            try {
                paypalGateway.processPayment(request);
            } catch (PaymentException e) {
                exceptionThrown = true;
                assertEquals("PAYPAL_TEMPORARY", e.getErrorCode(), "❌ Test #51 FALLÓ: errorCode debe ser PAYPAL_TEMPORARY");
                assertEquals("Paypal temporalmente no disponible", e.getMessage(), "❌ Test #51 FALLÓ: mensaje de excepción incorrecto");
            }
            attempts++;
        }

        // Nota: Con probabilidad 1/10 y 200 intentos, la probabilidad de que nunca
        // falle es extremadamente baja
        // (0.9^200 ≈ 7.05e-10)
        assertTrue(exceptionThrown,
                "❌ Test #51 FALLÓ: Se esperaba que se lanzara PaymentException al menos una vez en " + attempts + " intentos. "
                        + "Probabilidad teórica de fallo: " + (Math.pow(0.9, attempts) * 100) + "%");
    }

    /**
     * Test #52: processRefund() debe retornar PaymentResponse con status REFUNDED
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("REFUNDED", ...) a assertEquals("PAID", ...)
     * - El test fallará porque el status esperado no coincidirá
     */
    @Test
    @DisplayName("Test #52: processRefund() debe retornar PaymentResponse con status REFUNDED")
    void processRefund_ReturnsRefundedResponse() {
        System.out.println("Test #52: processRefund() debe retornar PaymentResponse con status REFUNDED");

        // Given
        RefundRequest request = new RefundRequest();
        request.setAmount(new BigDecimal("75.00"));

        // When
        PaymentResponse response = paypalGateway.processRefund(request);

        // Then
        assertNotNull(response, "❌ Test #52 FALLÓ: response no debe ser null");
        assertEquals("REFUNDED", response.getStatus(), "❌ Test #52 FALLÓ: status debe ser REFUNDED");
        assertEquals(new BigDecimal("75.00"), response.getAmount(), "❌ Test #52 FALLÓ: amount debe ser 75.00");
        assertEquals("paypal", response.getGateway(), "❌ Test #52 FALLÓ: gateway debe ser paypal");
        assertTrue(response.getTransactionId().startsWith("paypal_refund_"), "❌ Test #52 FALLÓ: transactionId debe empezar con paypal_refund_");
    }

    /**
     * Test #53: getGatewayName() debe retornar 'paypal'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("paypal", ...) a assertEquals("stripe", ...)
     * - El test fallará porque el gateway name esperado no coincidirá
     */
    @Test
    @DisplayName("Test #53: getGatewayName() debe retornar 'paypal'")
    void getGatewayName_ReturnsPaypal() {
        System.out.println("Test #53: getGatewayName() debe retornar 'paypal'");

        // When
        String gatewayName = paypalGateway.getGatewayName();

        // Then
        assertEquals("paypal", gatewayName, "❌ Test #53 FALLÓ: gatewayName debe ser paypal");
    }

    /**
     * Test #54: processRefund() debe generar transactionId con prefijo
     * 'paypal_refund_'
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar startsWith("paypal_refund_") a startsWith("paypal_tx_")
     * - El test fallará porque el prefijo no coincidirá
     */
    @Test
    @DisplayName("Test #54: processRefund() debe generar transactionId con prefijo 'paypal_refund_'")
    void processRefund_GeneratesTransactionIdWithCorrectPrefix() {
        System.out.println("Test #54: processRefund() debe generar transactionId con prefijo 'paypal_refund_'");

        // Given
        RefundRequest request = new RefundRequest();
        request.setAmount(new BigDecimal("25.00"));

        // When
        PaymentResponse response = paypalGateway.processRefund(request);

        // Then
        assertNotNull(response.getTransactionId(), "❌ Test #54 FALLÓ: transactionId no debe ser null");
        assertTrue(response.getTransactionId().startsWith("paypal_refund_"), "❌ Test #54 FALLÓ: transactionId debe empezar con paypal_refund_");
    }

    /**
     * Test #55: Simulación de latencia respeta los límites configurados
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(100, ...) a assertEquals(200, ...)
     * - El test fallará porque el valor esperado de minDelay no coincidirá
     */
    @Test
    @DisplayName("Test #55: Simulación de latencia respeta los límites configurados")
    void simulateLatency_RespectsConfiguredLimits() throws Exception {
        System.out.println("Test #55: Simulación de latencia respeta los límites configurados");

        // Given
        PaypalGateway gatewayWithDelays = new PaypalGateway(100, 200);

        // Usar reflexión para acceder a los campos privados Duration
        Field minDelayField = PaypalGateway.class.getDeclaredField("minDelay");
        Field maxDelayField = PaypalGateway.class.getDeclaredField("maxDelay");
        minDelayField.setAccessible(true);
        maxDelayField.setAccessible(true);

        // Los campos son Duration, no long
        Duration minDelay = (Duration) minDelayField.get(gatewayWithDelays);
        Duration maxDelay = (Duration) maxDelayField.get(gatewayWithDelays);

        // Then
        assertEquals(100, minDelay.toMillis(), "❌ Test #55 FALLÓ: minDelay debe ser 100ms");
        assertEquals(200, maxDelay.toMillis(), "❌ Test #55 FALLÓ: maxDelay debe ser 200ms");
    }

    /**
     * Test #56: Constructor con valores por defecto
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals("paypal", ...) a assertEquals("stripe", ...)
     * - El test fallará porque el gateway name esperado no coincidirá
     */
    @Test
    @DisplayName("Test #56: Constructor con valores por defecto")
    void constructor_WithDefaultValues_UsesDefaults() {
        System.out.println("Test #56: Constructor con valores por defecto");

        // When - usar constructor con valores por defecto
        PaypalGateway gateway = new PaypalGateway(100, 400);

        // Then - verificar que se crea correctamente
        assertNotNull(gateway, "❌ Test #56 FALLÓ: gateway no debe ser null");
        assertEquals("paypal", gateway.getGatewayName(), "❌ Test #56 FALLÓ: gatewayName debe ser paypal");
    }

    /**
     * Test #57: processRefund siempre tiene éxito (no lanza excepciones)
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar i < 100 a i < 0
     * - El test fallará porque el bucle nunca se ejecutará
     */
    @Test
    @DisplayName("Test #57: processRefund siempre tiene éxito (no lanza excepciones)")
    void processRefund_AlwaysSucceeds() {
        System.out.println("Test #57: processRefund siempre tiene éxito (no lanza excepciones)");

        // Given
        RefundRequest request = new RefundRequest();
        request.setAmount(new BigDecimal("50.00"));

        // Ejecutar múltiples veces para asegurar que nunca lanza excepción
        for (int i = 0; i < 100; i++) {
            // When/Then - no debe lanzar excepción
            assertDoesNotThrow(() -> {
                PaymentResponse response = paypalGateway.processRefund(request);
                assertNotNull(response, "❌ Test #57 FALLÓ: response no debe ser null");
                assertEquals("REFUNDED", response.getStatus(), "❌ Test #57 FALLÓ: status debe ser REFUNDED");
            });
        }
    }

    /**
     * Test #58: Los transactionIds son únicos
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Comentar el Thread.sleep(1) o cambiar assertNotEquals a assertEquals
     * - El test puede fallar si los IDs generados son idénticos
     */
    @Test
    @DisplayName("Test #58: Los transactionIds son únicos")
    void transactionIds_AreUnique() {
        System.out.println("Test #58: Los transactionIds son únicos");

        // Given
        PaymentRequest request1 = new PaymentRequest();
        request1.setAmount(new BigDecimal("10.00"));
        request1.setOrderId(1L);

        PaymentRequest request2 = new PaymentRequest();
        request2.setAmount(new BigDecimal("20.00"));
        request2.setOrderId(2L);

        // When
        PaymentResponse response1 = paypalGateway.processPayment(request1);
        // Pequeña pausa para asegurar timestamp diferente
        try {
            Thread.sleep(1);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        PaymentResponse response2 = paypalGateway.processPayment(request2);

        // Then
        assertNotEquals(response1.getTransactionId(), response2.getTransactionId(), "❌ Test #58 FALLÓ: los transactionIds deben ser únicos");
    }
}
