package com.example.payment_service.dto;

import com.example.payment_service.model.Payment;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ConfirmPaymentResponse {

    private Boolean success;
    private String message;
    private PaymentData data;
    private ErrorData error;

    public ConfirmPaymentResponse() {
    }

    public ConfirmPaymentResponse(Boolean success, String message, PaymentData data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public ConfirmPaymentResponse(Boolean success, String message, ErrorData error) {
        this.success = success;
        this.message = message;
        this.error = error;
    }

    // Getters and Setters
    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public PaymentData getData() {
        return data;
    }

    public void setData(PaymentData data) {
        this.data = data;
    }

    public ErrorData getError() {
        return error;
    }

    public void setError(ErrorData error) {
        this.error = error;
    }

    // Inner class for payment data
    public static class PaymentData {
        private Long paymentId;
        private Long orderId;
        private String status;
        private String transactionId;
        private BigDecimal amount;
        private Payment.Currency currency;
        private Payment.PaymentMethod paymentMethod;
        private LocalDateTime processedAt;

        // Getters and Setters
        public Long getPaymentId() {
            return paymentId;
        }

        public void setPaymentId(Long paymentId) {
            this.paymentId = paymentId;
        }

        public Long getOrderId() {
            return orderId;
        }

        public void setOrderId(Long orderId) {
            this.orderId = orderId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getTransactionId() {
            return transactionId;
        }

        public void setTransactionId(String transactionId) {
            this.transactionId = transactionId;
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

        public LocalDateTime getProcessedAt() {
            return processedAt;
        }

        public void setProcessedAt(LocalDateTime processedAt) {
            this.processedAt = processedAt;
        }
    }

    // Inner class for error data
    public static class ErrorData {
        private String code;
        private String message;

        public ErrorData() {
        }

        public ErrorData(String code, String message) {
            this.code = code;
            this.message = message;
        }

        // Getters and Setters
        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}

