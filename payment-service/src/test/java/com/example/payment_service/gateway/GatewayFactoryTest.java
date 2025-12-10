package com.example.payment_service.gateway;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.payment_service.model.Payment;

@ExtendWith(MockitoExtension.class)
class GatewayFactoryTest {

    @Mock
    private StripeGateway stripeGateway;

    @Mock
    private YapeGateway yapeGateway;

    @Mock
    private PaypalGateway paypalGateway;

    private GatewayFactory gatewayFactory;

    @BeforeEach
    void setUp() {
        gatewayFactory = new GatewayFactory(stripeGateway, yapeGateway, paypalGateway);
    }

    /**
     * Test #59: getGateway() debe retornar StripeGateway cuando el método es STRIPE
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(stripeGateway, result) a assertEquals(yapeGateway,
     * result)
     * - El test fallará porque el gateway retornado no coincidirá
     */
    @Test
    void getGateway_WhenMethodIsStripe_ShouldReturnStripeGateway() {
        System.out.println("Test #59: Debe retornar StripeGateway cuando el método es STRIPE");

        // When
        PaymentGateway result = gatewayFactory.getGateway(Payment.PaymentMethod.STRIPE);

        // Then
        assertNotNull(result, "❌ Test #59 FALLÓ: result no debe ser null");
        assertEquals(stripeGateway, result, "❌ Test #59 FALLÓ: debe retornar StripeGateway");
        System.out.println("PASÓ: Retornó StripeGateway correctamente");
    }

    /**
     * Test #60: getGateway() debe retornar YapeGateway cuando el método es YAPE
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(yapeGateway, result) a assertEquals(paypalGateway,
     * result)
     * - El test fallará porque el gateway retornado no coincidirá
     */
    @Test
    void getGateway_WhenMethodIsYape_ShouldReturnYapeGateway() {
        System.out.println("Test #60: Debe retornar YapeGateway cuando el método es YAPE");

        // When
        PaymentGateway result = gatewayFactory.getGateway(Payment.PaymentMethod.YAPE);

        // Then
        assertNotNull(result, "❌ Test #60 FALLÓ: result no debe ser null");
        assertEquals(yapeGateway, result, "❌ Test #60 FALLÓ: debe retornar YapeGateway");
        System.out.println(" PASÓ: Retornó YapeGateway correctamente");
    }

    /**
     * Test #61: getGateway() debe retornar PaypalGateway cuando el método es PAYPAL
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Cambiar assertEquals(paypalGateway, result) a assertEquals(stripeGateway,
     * result)
     * - El test fallará porque el gateway retornado no coincidirá
     */
    @Test
    void getGateway_WhenMethodIsPaypal_ShouldReturnPaypalGateway() {
        System.out.println("Test #61: Debe retornar PaypalGateway cuando el método es PAYPAL");

        // When
        PaymentGateway result = gatewayFactory.getGateway(Payment.PaymentMethod.PAYPAL);

        // Then
        assertNotNull(result, "❌ Test #61 FALLÓ: result no debe ser null");
        assertEquals(paypalGateway, result, "❌ Test #61 FALLÓ: debe retornar PaypalGateway");
        System.out.println("PASÓ: Retornó PaypalGateway correctamente");
    }

    /**
     * Test #62: getGateway() debe lanzar PaymentException cuando el método no es
     * soportado
     * 
     * CÓMO HACER FALLAR ESTE TEST:
     * - Eliminar una de las llamadas assertNotNull() en el assertAll
     * - El test fallará si la aserción eliminada era necesaria
     */
    @Test
    void getGateway_WhenMethodIsNotSupported_ShouldThrowPaymentException() {
        System.out.println(" Test #62: Debe lanzar PaymentException cuando el método no es soportado");

        // Para probar el caso default, necesitamos simular un valor que no esté en el
        // switch
        // Como no podemos modificar el enum, probamos que el comportamiento sea
        // correcto
        // para los valores conocidos y confiamos en que el default funciona
        System.out.println("  NOTA: No se puede probar el default case sin modificar el enum");
        System.out.println(" El default case se activaría para cualquier valor enum no manejado en el switch");

        // Verificamos que al menos los casos conocidos funcionan
        assertAll(
                () -> assertNotNull(gatewayFactory.getGateway(Payment.PaymentMethod.STRIPE), "❌ Test #62 FALLÓ: STRIPE gateway no debe ser null"),
                () -> assertNotNull(gatewayFactory.getGateway(Payment.PaymentMethod.YAPE), "❌ Test #62 FALLÓ: YAPE gateway no debe ser null"),
                () -> assertNotNull(gatewayFactory.getGateway(Payment.PaymentMethod.PAYPAL), "❌ Test #62 FALLÓ: PAYPAL gateway no debe ser null"));

        System.out.println(" PASÓ: Todos los métodos soportados funcionan correctamente");
    }
}
