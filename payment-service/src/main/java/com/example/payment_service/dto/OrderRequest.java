package com.example.payment_service.dto;

import com.example.payment_service.model.Payment;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class OrderRequest {

    @NotNull
    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;

    @NotNull
    @Positive
    @Digits(integer = 10, fraction = 2)
    private BigDecimal total;

    @NotNull
    private Payment.Currency currency;

    // Getters and Setters
    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
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

    // Inner class for order items
    public static class OrderItemRequest {
        @NotNull
        private Long sensorId;

        @NotBlank
        private String nombre;

        @NotNull
        @Min(1)
        private Integer cantidad;

        @NotNull
        @Positive
        @Digits(integer = 10, fraction = 2)
        private BigDecimal precioUnitario;

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
    }
}

