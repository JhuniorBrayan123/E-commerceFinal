package com.example.payment_service.dto;

import com.example.payment_service.model.Payment;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class PaymentRequest {

    @NotNull
    private Long orderId;

    @NotNull
    @Positive
    @Digits(integer = 10, fraction = 2)
    private BigDecimal amount;

    @NotNull
    private Payment.Currency currency;

    @NotNull
    private Payment.PaymentMethod paymentMethod;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
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

    public Payment.PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(Payment.PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
