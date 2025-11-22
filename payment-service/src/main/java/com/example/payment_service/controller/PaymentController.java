package com.example.payment_service.controller;

import com.example.payment_service.dto.*;
import com.example.payment_service.exception.PaymentException;
import com.example.payment_service.service.OrderService;
import com.example.payment_service.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    public PaymentController(PaymentService paymentService, OrderService orderService) {
        this.paymentService = paymentService;
        this.orderService = orderService;
    }

    /**
     * Crea una nueva orden de pago
     * POST /payment/order
     */
    @PostMapping("/order")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        OrderResponse response = orderService.createOrder(request, extractToken(authorization));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Confirma y procesa el pago de una orden
     * POST /payment/confirm
     */
    @PostMapping("/confirm")
    public ResponseEntity<ConfirmPaymentResponse> confirmPayment(
            @Valid @RequestBody ConfirmPaymentRequest request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        ConfirmPaymentResponse response = orderService.confirmPayment(request, extractToken(authorization));
        HttpStatus status = response.getSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    /**
     * Obtiene el estado de una orden
     * GET /payment/status/{orderId}
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<OrderResponse> getOrderStatus(
            @PathVariable Long orderId,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        OrderResponse response = orderService.getOrderStatus(orderId, extractToken(authorization));
        return ResponseEntity.ok(response);
    }

    // ====== Endpoints originales del PaymentService (mantener compatibilidad) ======

    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(
            @Valid @RequestBody PaymentRequest request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        PaymentResponse response = paymentService.processPayment(request, extractToken(authorization));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.getPayment(paymentId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrder(orderId));
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(
            @PathVariable Long paymentId,
            @Valid @RequestBody RefundRequest request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        PaymentResponse response = paymentService.processRefund(paymentId, request, extractToken(authorization));
        return ResponseEntity.ok(response);
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw PaymentException.unauthorized("INVALID_TOKEN", "Authorization header invalido");
        }
        return authorizationHeader.substring("Bearer ".length());
    }
}
