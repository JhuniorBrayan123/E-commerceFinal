package com.example.payment_service.dto;

import java.math.BigDecimal;

public class CouponValidationRequest {
    private String codigo;
    private BigDecimal total;
    private Long usuarioId;

    public CouponValidationRequest() {
    }

    public CouponValidationRequest(String codigo, BigDecimal total, Long usuarioId) {
        this.codigo = codigo;
        this.total = total;
        this.usuarioId = usuarioId;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
}
