package com.example.payment_service.event;

import java.util.List;

import com.example.payment_service.model.OrderItem;

public class PaymentCompletedEvent {

    private final Long orderId;
    private final Long paymentId;
    private final List<OrderItem> items;
    private final String jwtToken;

    public PaymentCompletedEvent(Long orderId, Long paymentId, List<OrderItem> items, String jwtToken) {
        this.orderId = orderId;
        this.paymentId = paymentId;
        this.items = items;
        this.jwtToken = jwtToken;
    }

    public Long getOrderId() {
        return orderId;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public String getJwtToken() {
        return jwtToken;
    }
}
