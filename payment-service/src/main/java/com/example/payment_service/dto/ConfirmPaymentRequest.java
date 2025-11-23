package com.example.payment_service.dto;

import com.example.payment_service.model.Payment;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Map;

public class ConfirmPaymentRequest {

    @NotNull
    private Long orderId;

    @NotBlank
    private String paymentToken;

    @NotNull
    private Payment.PaymentMethod paymentMethod;

    @NotNull
    @Positive
    @Digits(integer = 10, fraction = 2)
    private BigDecimal amount;

    @NotNull
    private Payment.Currency currency;

    // Datos específicos del método de pago (ej: tarjeta, Yape, PayPal)
    private Map<String, Object> paymentData;

    // Getters and Setters
    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getPaymentToken() {
        return paymentToken;
    }

    public void setPaymentToken(String paymentToken) {
        this.paymentToken = paymentToken;
    }

    public Payment.PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(Payment.PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Payment.Currency getCurrency() {
        return currency;
    }

    public void setCurrency(Payment.Currency currency) {
        this.currency = currency;
    }

    public Map<String, Object> getPaymentData() {
        return paymentData;
    }

    public void setPaymentData(Map<String, Object> paymentData) {
        this.paymentData = paymentData;
    }
}

