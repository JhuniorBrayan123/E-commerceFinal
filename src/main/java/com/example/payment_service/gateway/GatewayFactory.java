package com.example.payment_service.gateway;

import com.example.payment_service.exception.PaymentException;
import com.example.payment_service.model.Payment;
import org.springframework.stereotype.Component;

@Component
public class GatewayFactory {

    private final StripeGateway stripeGateway;
    private final YapeGateway yapeGateway;
    private final PaypalGateway paypalGateway;

    public GatewayFactory(
            StripeGateway stripeGateway,
            YapeGateway yapeGateway,
            PaypalGateway paypalGateway) {
        this.stripeGateway = stripeGateway;
        this.yapeGateway = yapeGateway;
        this.paypalGateway = paypalGateway;
    }

    public PaymentGateway getGateway(Payment.PaymentMethod method) {
        return switch (method) {
            case STRIPE -> stripeGateway;
            case YAPE -> yapeGateway;
            case PAYPAL -> paypalGateway;
            default -> throw PaymentException.badRequest("INVALID_GATEWAY", "Gateway no soportado");
        };
    }
}

