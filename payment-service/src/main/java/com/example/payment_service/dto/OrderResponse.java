package com.example.payment_service.dto;

import com.example.payment_service.model.Payment;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Boolean success;
    private String message;
    private OrderData data;

    public OrderResponse() {
    }

    public OrderResponse(Boolean success, String message, OrderData data) {
        this.success = success;
        this.message = message;
        this.data = data;
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

    public OrderData getData() {
        return data;
    }

    public void setData(OrderData data) {
        this.data = data;
    }

    // Inner class for order data
    public static class OrderData {
        private Long orderId;
        private String paymentToken;
        private BigDecimal total;
        private Payment.Currency currency;
        private String status;
        private List<OrderItemResponse> items;
        private LocalDateTime createdAt;

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

        public BigDecimal getTotal() {
            return total;
        }

        public void setTotal(BigDecimal total) {
            this.total = total;
        }

        public Payment.Currency getCurrency() {
            return currency;
        }

        public void setCurrency(Payment.Currency currency) {
            this.currency = currency;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public List<OrderItemResponse> getItems() {
            return items;
        }

        public void setItems(List<OrderItemResponse> items) {
            this.items = items;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }

    // Inner class for order items response
    public static class OrderItemResponse {
        private Long sensorId;
        private String nombre;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;

        // Getters and Setters
        public Long getSensorId() {
            return sensorId;
        }

        public void setSensorId(Long sensorId) {
            this.sensorId = sensorId;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public Integer getCantidad() {
            return cantidad;
        }

        public void setCantidad(Integer cantidad) {
            this.cantidad = cantidad;
        }

        public BigDecimal getPrecioUnitario() {
            return precioUnitario;
        }

        public void setPrecioUnitario(BigDecimal precioUnitario) {
            this.precioUnitario = precioUnitario;
        }

        public BigDecimal getSubtotal() {
            return subtotal;
        }

        public void setSubtotal(BigDecimal subtotal) {
            this.subtotal = subtotal;
        }
    }
}

