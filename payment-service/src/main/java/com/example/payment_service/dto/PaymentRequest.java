package com.example.payment_service.dto;

import java.math.BigDecimal;
import java.util.List;

import com.example.payment_service.model.OrderItem;
import com.example.payment_service.model.Payment;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

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

    // 🔥 NUEVO: Items de la orden
    @NotNull
    private List<OrderItem> items;

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

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
}
