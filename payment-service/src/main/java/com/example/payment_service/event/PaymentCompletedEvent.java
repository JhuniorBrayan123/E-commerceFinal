package com.example.payment_service.event;

import java.util.List;
import com.example.payment_service.dto.PaymentItemDto;

public class PaymentCompletedEvent {

    private final Long orderId;
    private final Long paymentId;
    private final List<PaymentItemDto> items;
    private final String jwtToken;

    public PaymentCompletedEvent(Long orderId, Long paymentId, List<PaymentItemDto> items, String jwtToken) {
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

    public List<PaymentItemDto> getItems() {
        return items;
    }

    public String getJwtToken() {
        return jwtToken;
    }
}
