import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carritoService } from '../services/api';
import { orderService } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

interface OrderItem {
  sensorId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface AppliedCoupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar si el usuario está logueado
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Debes iniciar sesión para continuar con la compra');
      navigate('/auth');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const items = carritoService.get();
    if (items.length === 0) {
      navigate('/carrito');
      return;
    }
    setCarrito(items);

    // Calcular subtotal
    const currentSubtotal = carritoService.getTotal();
    setSubtotal(currentSubtotal);

    // Recuperar cupón aplicado
    const appliedCouponStr = localStorage.getItem('appliedCoupon');
    if (appliedCouponStr) {
      try {
        const coupon = JSON.parse(appliedCouponStr);
        setAppliedCoupon(coupon);
        // Calcular total con descuento
        setTotal(Math.max(0, currentSubtotal - coupon.discount));
      } catch (e) {
        console.error("Error parsing coupon:", e);
        setTotal(currentSubtotal);
      }
    } else {
      setTotal(currentSubtotal);
    }
  }, [navigate]);

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      // Preparar items de la orden con el formato correcto para el backend
      const items = carrito.map((item) => {
        const precio = parseFloat(item.precio);
        return {
          sensorId: item.id,
          nombre: item.nombre || 'Sensor sin nombre',
          cantidad: item.cantidad,
          precioUnitario: parseFloat(precio.toFixed(2)),
        };
      });

      // Crear la orden con el formato correcto
      const orderData = {
        items,
        total: parseFloat(total.toFixed(2)),
        currency: 'PEN', // Cambiado a PEN (Soles Peruanos)
        couponCode: appliedCoupon?.code || null
      };

      const response = await orderService.createOrder(orderData);

      // Verificar la respuesta - puede venir directamente como objeto o dentro de data
      let orderDataResponse = response;

      // Si la respuesta tiene una estructura diferente, intentar adaptarla
      if (response.data && response.data.orderId) {
        orderDataResponse = response.data;
      } else if (!response.success && response.data) {
        orderDataResponse = response.data;
      }

      if ((response.success !== false) && (orderDataResponse.orderId || response.data?.orderId)) {
        const orderId = orderDataResponse.orderId || response.data.orderId;
        const paymentToken = orderDataResponse.paymentToken || response.data.paymentToken;
        const orderTotal = orderDataResponse.total || response.data.total;
        const orderCurrency = orderDataResponse.currency || response.data.currency;
        const orderItems = orderDataResponse.items || response.data.items;

        // Guardar orderId y paymentToken en localStorage para el siguiente paso
        localStorage.setItem('currentOrderId', orderId.toString());
        localStorage.setItem('currentPaymentToken', paymentToken);

        // Limpiar cupón aplicado después de crear la orden
        localStorage.removeItem('appliedCoupon');

        // Navegar a la página de selección de método de pago
        navigate('/payment-method', {
          state: {
            orderId: orderId,
            paymentToken: paymentToken,
            total: typeof orderTotal === 'string' ? parseFloat(orderTotal) : orderTotal,
            currency: orderCurrency,
            items: orderItems || items
          }
        });
      } else {
        const errorMsg = response.message || response.error?.message || 'Error al crear la orden';
        console.error('Error en respuesta:', errorMsg, response);
        setError(errorMsg);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error creating order:', err);

      let errorMessage = 'Error al procesar la orden. Por favor intenta nuevamente.';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = typeof err.response.data.error === 'string'
          ? err.response.data.error
          : err.response.data.error.message || 'Error desconocido';
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  if (carrito.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Resumen de Compra</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Items de la orden */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Items en tu orden</h2>
          {carrito.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                {item.imagen_url || item.imagen ? (
                  <img
                    src={getImageUrl(item.imagen_url || item.imagen)}
                    alt={item.nombre}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%239ca3af"%3ESin imagen%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Sin imagen</span>
                  </div>
                )}
                <div className="flex-grow w-full sm:w-auto">
                  <h3 className="text-lg sm:text-xl font-semibold break-words">{item.nombre}</h3>
                  {item.descripcion && (
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{item.descripcion}</p>
                  )}
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">Cantidad: {item.cantidad}</p>
                  <p className="text-primary-600 font-bold mt-2 text-sm sm:text-base">
                    S/ {item.precio} x {item.cantidad} = S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen y acciones */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Resumen del Pedido</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Descuento ({appliedCoupon.code}):</span>
                  <span>-S/ {appliedCoupon.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Envío:</span>
                <span>Gratis</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-xl">
                <span>Total:</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="btn-animated w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
            >
              {loading ? 'Creando orden...' : 'Crear Orden y Continuar'}
            </button>
            <button
              onClick={() => navigate('/carrito')}
              className="btn-animated w-full mt-3 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Volver al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
