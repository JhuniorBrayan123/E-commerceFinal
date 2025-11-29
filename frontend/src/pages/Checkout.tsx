import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carritoService } from '../services/api';
import { orderService } from '../services/api';

interface OrderItem {
  sensorId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
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
    setTotal(carritoService.getTotal());
  }, [navigate]);

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      // Recuperar cupón aplicado desde localStorage
      const appliedCouponStr = localStorage.getItem('appliedCoupon');
      const appliedCoupon = appliedCouponStr ? JSON.parse(appliedCouponStr) : null;

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

      console.log('Enviando orden:', JSON.stringify(orderData, null, 2));

      const response = await orderService.createOrder(orderData);

      console.log('Respuesta del servidor completa:', response);

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

        console.log('Navegando con datos:', { orderId, paymentToken, orderTotal, orderCurrency });

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
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Resumen de Compra</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items de la orden */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Items en tu orden</h2>
          {carrito.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                {item.imagen_url || item.imagen ? (
                  <img
                    src={item.imagen_url || item.imagen}
                    alt={item.nombre}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold">{item.nombre}</h3>
                  <p className="text-gray-600 text-sm mt-1">Cantidad: {item.cantidad}</p>
                  <p className="text-primary-600 font-bold mt-2">
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
                <span>S/ {total.toFixed(2)}</span>
              </div>
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
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando orden...' : 'Crear Orden y Continuar'}
            </button>
            <button
              onClick={() => navigate('/carrito')}
              className="w-full mt-3 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
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
