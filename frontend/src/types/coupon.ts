// Types para cupones de descuento
export interface CouponValidationRequest {
    codigo: string;
    total: number;
    usuario_id?: number;
}

export interface CouponInfo {
    codigo: string;
    descripcion: string;
    tipo: 'porcentaje' | 'fijo';
    valor: number;
}

export interface CouponValidationResponse {
    valid: boolean;
    message: string;
    discount: number;
    cupon_info?: CouponInfo;
    monto_minimo?: number;
}

export interface AppliedCoupon {
    code: string;
    discount: number;
    info?: CouponInfo;
}
