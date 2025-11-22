import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentService } from '../services/api';

interface ConfirmPaymentProps {
  orderId: number;
  paymentToken: string;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentData: any;
}

const ConfirmPayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const paymentInfo = location.state as ConfirmPaymentProps | null;

  useEffect(() => {
    if (!paymentInfo) {
      navigate('/carrito');
      return;
    }
  }, [paymentInfo, navigate]);

  if (!paymentInfo) {
    return null;
  }

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError(null);
    setConfirming(true);

    try {
      const confirmData = {
        orderId: paymentInfo.orderId,
        paymentToken: paymentInfo.paymentToken,
        paymentMethod: paymentInfo.paymentMethod,
        amount: paymentInfo.total.toString(),
        currency: paymentInfo.currency,
        paymentData: paymentInfo.paymentData,
      };

      const response = await paymentService.confirmPayment(confirmData);

      if (response.success) {
        // Navegar a la página de resultado exitoso
        navigate('/payment-result', {
          state: {
            success: true,
            paymentData: response.data,
            orderId: paymentInfo.orderId,
          },
        });
      } else {
        // Navegar a la página de resultado con error
        navigate('/payment-result', {
          state: {
            success: false,
            error: response.error || { message: response.message || 'Error al procesar el pago' },
            orderId: paymentInfo.orderId,
          },
        });
      }
    } catch (err: any) {
      // Navegar a la página de resultado con error
      navigate('/payment-result', {
        state: {
          success: false,
          error: { message: err.message || 'Error al procesar el pago' },
          orderId: paymentInfo.orderId,
        },
      });
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'STRIPE':
        return 'Tarjeta de Crédito/Débito (Stripe)';
      case 'YAPE':
        return 'Yape';
      case 'PAYPAL':
        return 'PayPal';
      default:
        return method;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Confirmar Pago</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detalles del pago */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Detalles del Pago</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Orden ID:</span>
                <span className="font-semibold">#{paymentInfo.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Método de Pago:</span>
                <span className="font-semibold">{getPaymentMethodName(paymentInfo.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monto:</span>
                <span className="font-semibold">${paymentInfo.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Moneda:</span>
                <span className="font-semibold">{paymentInfo.currency}</span>
              </div>
            </div>
          </div>

          {paymentInfo.paymentMethod === 'STRIPE' && paymentInfo.paymentData.cardNumber && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Información de la Tarjeta</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-600">Tarjeta:</span>{' '}
                  <span className="font-mono">
                    **** **** **** {paymentInfo.paymentData.cardNumber.slice(-4)}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Vence:</span>{' '}
                  <span className="font-mono">
                    {paymentInfo.paymentData.expMonth}/{paymentInfo.paymentData.expYear}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>⚠️ Importante:</strong> Al confirmar, se procesará el pago inmediatamente. 
              Por favor, revisa todos los detalles antes de continuar.
            </p>
          </div>
        </div>

        {/* Resumen y acciones */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Resumen</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Total a Pagar:</span>
                <span className="font-bold text-xl text-primary-600">
                  ${paymentInfo.total.toFixed(2)}
                </span>
              </div>
            </div>

            {confirming && (
              <div className="mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  <span className="text-sm text-gray-600">Procesando pago...</span>
                </div>
              </div>
            )}

            <button
              onClick={async () => {
                try {
                  await handleConfirmPayment();
                } catch (err) {
                  console.error('Error en handleConfirmPayment:', err);
                  setError('Error al procesar el pago. Por favor intenta nuevamente.');
                  setLoading(false);
                  setConfirming(false);
                }
              }}
              disabled={loading || confirming}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {confirming ? 'Procesando...' : 'Confirmar y Pagar'}
            </button>
            <button
              onClick={() => {
                try {
                  navigate('/payment-method', { state: paymentInfo });
                } catch (err) {
                  console.error('Error al navegar:', err);
                }
              }}
              disabled={loading || confirming}
              className="w-full mt-3 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPayment;

