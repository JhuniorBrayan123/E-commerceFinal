package com.example.payment_service.gateway;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.RefundRequest;

public interface PaymentGateway {

    PaymentResponse processPayment(PaymentRequest request);

    PaymentResponse processRefund(RefundRequest request);

    String getGatewayName();
}
