package com.example.payment_service.dto;

public class PaymentItemDto {

    private Long sensorId;
    private Integer cantidad;
    private String nombre; // opcional
    private java.math.BigDecimal precioUnitario; // opcional

    // Constructors
    public PaymentItemDto() {
    }

    public PaymentItemDto(Long sensorId, Integer cantidad, String nombre, java.math.BigDecimal precioUnitario) {
        this.sensorId = sensorId;
        this.cantidad = cantidad;
        this.nombre = nombre;
        this.precioUnitario = precioUnitario;
    }

    // Getters / Setters
    public Long getSensorId() {
        return sensorId;
    }

    public void setSensorId(Long sensorId) {
        this.sensorId = sensorId;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public java.math.BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(java.math.BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
}
