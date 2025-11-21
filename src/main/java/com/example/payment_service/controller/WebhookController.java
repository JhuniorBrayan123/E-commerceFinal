package com.example.payment_service.controller;

import com.example.payment_service.exception.PaymentException;
import com.example.payment_service.gateway.StripeGateway;
import com.example.payment_service.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private final PaymentService paymentService;
    private final StripeGateway stripeGateway;

    public WebhookController(PaymentService paymentService, StripeGateway stripeGateway) {
        this.paymentService = paymentService;
        this.stripeGateway = stripeGateway;
    }

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {
        if (!stripeGateway.validateWebhook(payload, signature)) {
            throw PaymentException.badRequest("INVALID_SIGNATURE", "Firma de Stripe invalida");
        }

        paymentService.handleWebhookEvent(stripeGateway.getGatewayName(), payload);
        return ResponseEntity.ok("Webhook processed");
    }
}

