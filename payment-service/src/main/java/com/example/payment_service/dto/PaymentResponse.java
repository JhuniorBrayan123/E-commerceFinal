package com.example.payment_service.dto;

import java.math.BigDecimal;

public class PaymentResponse {

    private String transactionId;
    private String status;
    private BigDecimal amount;
    private String gateway;

    // Constructor vacio
    public PaymentResponse() {
    }

    // Constructor completo
    public PaymentResponse(String transactionId, String status, BigDecimal amount, String gateway) {
        this.transactionId = transactionId;
        this.status = status;
        this.amount = amount;
        this.gateway = gateway;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public String getStatus() {
        return status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getGateway() {
        return gateway;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setGateway(String gateway) {
        this.gateway = gateway;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private String transactionId;
        private String status;
        private BigDecimal amount;
        private String gateway;

        public Builder transactionId(String transactionId) {
            this.transactionId = transactionId;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public Builder gateway(String gateway) {
            this.gateway = gateway;
            return this;
        }

        public PaymentResponse build() {
            return new PaymentResponse(transactionId, status, amount, gateway);
        }
    }
}
