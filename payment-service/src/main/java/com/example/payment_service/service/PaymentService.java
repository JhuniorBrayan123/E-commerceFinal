package com.example.payment_service.service;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.RefundRequest;

public interface PaymentService {

    PaymentResponse processPayment(PaymentRequest request, String jwtToken);

    PaymentResponse getPayment(Long paymentId);

    PaymentResponse getPaymentByOrder(Long orderId);

    PaymentResponse processRefund(Long paymentId, RefundRequest request, String jwtToken);

    void handleWebhookEvent(String provider, String payload);
}
