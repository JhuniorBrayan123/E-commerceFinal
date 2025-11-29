import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type PaymentMethodType = 'STRIPE' | 'YAPE' | 'PAYPAL';

interface PaymentMethodProps {
  orderId: number;
  paymentToken: string;
  total: number;
  currency: string;
}

const PaymentMethod: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [paymentData, setPaymentData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderData = location.state as PaymentMethodProps | null;

  useEffect(() => {
    if (!orderData) {
      navigate('/carrito');
      return;
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    setError(null);
    // No resetear payment data cuando se cambia el método
    // Esto permite que el usuario mantenga los datos ingresados
    // setPaymentData({});
  };

  const handlePaymentDataChange = (field: string, value: any) => {
    setPaymentData({
      ...paymentData,
      [field]: value,
    });
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      setError('Por favor selecciona un método de pago');
      return;
    }

    // Validar datos según el método seleccionado
    if (selectedMethod === 'STRIPE') {
      if (!paymentData.cardNumber || !paymentData.expMonth || !paymentData.expYear || !paymentData.cvv) {
        setError('Por favor completa todos los campos de la tarjeta');
        return;
      }
    }

    // Navegar a la página de confirmación
    navigate('/confirm-payment', {
      state: {
        ...orderData,
        paymentMethod: selectedMethod,
        paymentData,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Selecciona Método de Pago</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selección de método de pago */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold mb-4">
            Métodos de Pago Disponibles
          </h2>

          {/* Método: Stripe (Tarjeta) */}
          <div
            className={`border-2 rounded-lg p-6 cursor-pointer transition ${selectedMethod === "STRIPE"
                ? "border-primary-600 bg-primary-50"
                : "border-gray-300 hover:border-gray-400"
              }`}
            onClick={() => handleMethodSelect("STRIPE")}
          >
            <div className="flex items-center space-x-4">
              <input
                type="radio"
                name="paymentMethod"
                value="STRIPE"
                checked={selectedMethod === "STRIPE"}
                onChange={() => handleMethodSelect("STRIPE")}
                className="w-5 h-5 text-primary-600"
              />
              <div>
                <h3 className="text-xl font-semibold">
                  Tarjeta de Crédito/Débito (Stripe)
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Pago seguro con tarjeta Visa, Mastercard, American Express
                </p>
              </div>
            </div>

            {selectedMethod === "STRIPE" && (
              <div className="mt-4 space-y-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Número de Tarjeta
                  </label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    value={paymentData.cardNumber || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\s/g, "")
                        .replace(/\D/g, "");
                      const formatted = value.replace(/(.{4})/g, "$1 ").trim();
                      handlePaymentDataChange("cardNumber", formatted);
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mes
                    </label>
                    <input
                      type="text"
                      placeholder="12"
                      maxLength={2}
                      value={paymentData.expMonth || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 2);
                        handlePaymentDataChange("expMonth", value);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Año
                    </label>
                    <input
                      type="text"
                      placeholder="2025"
                      maxLength={4}
                      value={paymentData.expYear || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        handlePaymentDataChange("expYear", value);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength={4}
                      value={paymentData.cvv || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        handlePaymentDataChange("cvv", value);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  💳 Usa la tarjeta de prueba: 4242 4242 4242 4242
                </p>
              </div>
            )}
          </div>

          {/* Método: Yape */}
          <div
            className={`border-2 rounded-lg p-6 cursor-pointer transition ${selectedMethod === "YAPE"
                ? "border-primary-600 bg-primary-50"
                : "border-gray-300 hover:border-gray-400"
              }`}
            onClick={() => handleMethodSelect("YAPE")}
          >
            <div className="flex items-center space-x-4">
              <input
                type="radio"
                name="paymentMethod"
                value="YAPE"
                checked={selectedMethod === "YAPE"}
                onChange={() => handleMethodSelect("YAPE")}
                className="w-5 h-5 text-primary-600"
              />
              <div>
                <h3 className="text-xl font-semibold">Yape</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Pago rápido y seguro con Yape
                </p>
              </div>
            </div>
          </div>

          {/* Método: PayPal */}
          <div
            className={`border-2 rounded-lg p-6 cursor-pointer transition ${selectedMethod === "PAYPAL"
                ? "border-primary-600 bg-primary-50"
                : "border-gray-300 hover:border-gray-400"
              }`}
            onClick={() => handleMethodSelect("PAYPAL")}
          >
            <div className="flex items-center space-x-4">
              <input
                type="radio"
                name="paymentMethod"
                value="PAYPAL"
                checked={selectedMethod === "PAYPAL"}
                onChange={() => handleMethodSelect("PAYPAL")}
                className="w-5 h-5 text-primary-600"
              />
              <div>
                <h3 className="text-xl font-semibold">PayPal</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Paga con tu cuenta PayPal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Resumen</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold text-xl">
                  ${orderData.total ? orderData.total.toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                try {
                  handleContinue();
                } catch (err) {
                  console.error("Error en handleContinue:", err);
                  setError("Error al continuar. Por favor intenta nuevamente.");
                }
              }}
              disabled={!selectedMethod || loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
            <button
              onClick={() => {
                try {
                  navigate("/checkout");
                } catch (err) {
                  console.error("Error al navegar:", err);
                }
              }}
              className="w-full mt-3 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;

