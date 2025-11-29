import React, { useState } from 'react';
import { cuponService } from '../services/cuponService';
import { AppliedCoupon } from '../types/coupon';

interface CouponInputProps {
    total: number;
    onCouponApplied: (coupon: AppliedCoupon) => void;
    onCouponRemoved: () => void;
    appliedCoupon: AppliedCoupon | null;
}

const CouponInput: React.FC<CouponInputProps> = ({
    total,
    onCouponApplied,
    onCouponRemoved,
    appliedCoupon
}) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleApply = async () => {
        if (!code.trim()) {
            setError('Por favor ingresa un código de cupón');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Obtener usuario actual si está logueado
            const userStr = localStorage.getItem('user');
            const userId = userStr ? JSON.parse(userStr).id : undefined;

            const response = await cuponService.validate(code, total, userId);

            if (response.valid) {
                onCouponApplied({
                    code: code.toUpperCase(),
                    discount: response.discount,
                    info: response.cupon_info
                });
                setCode('');
                setError('');
            } else {
                setError(response.message || 'Cupón inválido');
            }
        } catch (err) {
            setError('Error al validar cupón. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        onCouponRemoved();
        setCode('');
        setError('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleApply();
        }
    };

    if (appliedCoupon) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <p className="text-green-800 font-semibold">
                                Cupón {appliedCoupon.code} aplicado
                            </p>
                            {appliedCoupon.info && (
                                <p className="text-green-600 text-sm">
                                    {appliedCoupon.info.descripcion}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                        Quitar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
                ¿Tienes un cupón de descuento?
            </label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    placeholder="Ingresa tu código"
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
                    maxLength={50}
                />
                <button
                    onClick={handleApply}
                    disabled={loading || !code.trim()}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {loading ? 'Validando...' : 'Aplicar'}
                </button>
            </div>
            {error && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default CouponInput;
