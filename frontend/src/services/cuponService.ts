import { CouponValidationRequest, CouponValidationResponse } from '../types/coupon';

const API_URL = 'http://localhost:8000/api/cupones';

export const cuponService = {
    /**
     * Valida un cupón de descuento
     */
    async validate(codigo: string, total: number, usuarioId?: number): Promise<CouponValidationResponse> {
        try {
            const requestBody: CouponValidationRequest = {
                codigo: codigo.toUpperCase().trim(),
                total,
                usuario_id: usuarioId
            };

            const response = await fetch(`${API_URL}/validate/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('Error al validar cupón');
            }

            const data: CouponValidationResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Error validando cupón:', error);
            return {
                valid: false,
                message: 'Error al validar cupón. Por favor intenta de nuevo.',
                discount: 0
            };
        }
    }
};
