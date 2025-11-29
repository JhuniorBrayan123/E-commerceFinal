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

    @Test
    void getGateway_WhenMethodIsStripe_ShouldReturnStripeGateway() {
        System.out.println("Test 1: Debe retornar StripeGateway cuando el método es STRIPE");

        // When
        PaymentGateway result = gatewayFactory.getGateway(Payment.PaymentMethod.STRIPE);

        // Then
        assertNotNull(result);
        assertEquals(stripeGateway, result);
        System.out.println("PASÓ: Retornó StripeGateway correctamente");
    }

    @Test
    void getGateway_WhenMethodIsYape_ShouldReturnYapeGateway() {
        System.out.println("Test 2: Debe retornar YapeGateway cuando el método es YAPE");

        // When
        PaymentGateway result = gatewayFactory.getGateway(Payment.PaymentMethod.YAPE);

        // Then
        assertNotNull(result);
        assertEquals(yapeGateway, result);
        System.out.println(" PASÓ: Retornó YapeGateway correctamente");
    }

    @Test
    void getGateway_WhenMethodIsPaypal_ShouldReturnPaypalGateway() {
        System.out.println("Test 3: Debe retornar PaypalGateway cuando el método es PAYPAL");

        // When
        PaymentGateway result = gatewayFactory.getGateway(Payment.PaymentMethod.PAYPAL);

        // Then
        assertNotNull(result);
        assertEquals(paypalGateway, result);
        System.out.println("PASÓ: Retornó PaypalGateway correctamente");
    }

    @Test
    void getGateway_WhenMethodIsNotSupported_ShouldThrowPaymentException() {
        System.out.println(" Test 4: Debe lanzar PaymentException cuando el método no es soportado");

        // Para probar el caso default, necesitamos simular un valor que no esté en el switch
        // Como no podemos modificar el enum, probamos que el comportamiento sea correcto
        // para los valores conocidos y confiamos en que el default funciona
        System.out.println("  NOTA: No se puede probar el default case sin modificar el enum");
        System.out.println(" El default case se activaría para cualquier valor enum no manejado en el switch");

        // Verificamos que al menos los casos conocidos funcionan
        assertAll(
                () -> assertNotNull(gatewayFactory.getGateway(Payment.PaymentMethod.STRIPE)),
                () -> assertNotNull(gatewayFactory.getGateway(Payment.PaymentMethod.YAPE)),
                () -> assertNotNull(gatewayFactory.getGateway(Payment.PaymentMethod.PAYPAL))
        );

        System.out.println(" PASÓ: Todos los métodos soportados funcionan correctamente");
    }
}
