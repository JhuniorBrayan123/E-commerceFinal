import React, { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { carritoService } from "../services/api";

interface PaymentResultProps {
  success: boolean;
  paymentData?: any;
  error?: any;
  orderId?: number;
}

const PaymentResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state as PaymentResultProps | null;

  useEffect(() => {
    if (!result) {
      navigate("/carrito");
      return;
    }

    // Si el pago fue exitoso, limpiar el carrito
    if (result.success) {
      carritoService.clear();
      localStorage.removeItem("currentOrderId");
      localStorage.removeItem("currentPaymentToken");
    }
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  if (result.success && result.paymentData) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Icono de éxito */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-green-600 mb-4">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600 mb-8">
            Tu pago ha sido procesado correctamente. Gracias por tu compra.
          </p>

          {/* Detalles del pago */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Detalles del Pago</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Orden ID:</span>
                <span className="font-semibold">
                  #{result.paymentData.orderId || result.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pago ID:</span>
                <span className="font-semibold">
                  #{result.paymentData.paymentId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transacción ID:</span>
                <span className="font-mono text-sm">
                  {result.paymentData.transactionId || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monto:</span>
                <span className="font-semibold">
                  S/ {result.paymentData.amount || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Método de Pago:</span>
                <span className="font-semibold">
                  {result.paymentData.paymentMethod || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-semibold text-green-600">
                  {result.paymentData.status || "PAID"}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sensores"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Continuar Comprando
            </Link>
            <Link
              to="/"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vista de error
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Icono de error */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg
            className="h-10 w-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-red-600 mb-4">Pago Fallido</h1>
        <p className="text-gray-600 mb-4">
          {result.error?.message ||
            "No se pudo procesar tu pago. Por favor, intenta nuevamente."}
        </p>

        {result.error?.code && (
          <p className="text-sm text-gray-500 mb-8">
            Código de error: {result.error.code}
          </p>
        )}

        {/* Detalles del pago fallido */}
        {result.orderId && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Detalles</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Orden ID:</span>
                <span className="font-semibold">#{result.orderId}</span>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              const orderId = localStorage.getItem("currentOrderId");
              const paymentToken = localStorage.getItem("currentPaymentToken");
              if (orderId && paymentToken) {
                navigate("/payment-method", {
                  state: {
                    orderId: parseInt(orderId),
                    paymentToken,
                  },
                });
              } else {
                navigate("/carrito");
              }
            }}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Intentar Nuevamente
          </button>
          <Link
            to="/carrito"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Volver al Carrito
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
