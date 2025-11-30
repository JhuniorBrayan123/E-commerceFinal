package com.example.payment_service.dto;

import java.math.BigDecimal;

public class CouponValidationResponse {
    private boolean valid;
    private String message;
    private BigDecimal discount;
    private CouponInfo cuponInfo;

    public CouponValidationResponse() {
    }

    public CouponValidationResponse(boolean valid, String message, BigDecimal discount) {
        this.valid = valid;
        this.message = message;
        this.discount = discount;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public CouponInfo getCuponInfo() {
        return cuponInfo;
    }

    public void setCuponInfo(CouponInfo cuponInfo) {
        this.cuponInfo = cuponInfo;
    }

    // Clase interna para información del cupón
    public static class CouponInfo {
        private String codigo;
        private String descripcion;
        private String tipo;
        private BigDecimal valor;

        public CouponInfo() {
        }

        public String getCodigo() {
            return codigo;
        }

        public void setCodigo(String codigo) {
            this.codigo = codigo;
        }

        public String getDescripcion() {
            return descripcion;
        }

        public void setDescripcion(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getTipo() {
            return tipo;
        }

        public void setTipo(String tipo) {
            this.tipo = tipo;
        }

        public BigDecimal getValor() {
            return valor;
        }

        public void setValor(BigDecimal valor) {
            this.valor = valor;
        }
    }
}
