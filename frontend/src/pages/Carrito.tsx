import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { carritoService } from '../services/api';
import CouponInput from '../components/CouponInput';
import { AppliedCoupon } from '../types/coupon';
import { getImageUrl } from '../utils/imageUtils';

const Carrito: React.FC = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    const actualizarCarrito = () => {
      const items = carritoService.get();
      setCarrito(items);
      setTotal(carritoService.getTotal());
    };
    actualizarCarrito();
  }, []);

  const actualizarCarrito = () => {
    const items = carritoService.get();
    setCarrito(items);
    setTotal(carritoService.getTotal());
  };

  const handleActualizarCantidad = (productoId: number, cantidad: number, oper: string, stock: number) => {
    if (oper === '+') {
      cantidad = Math.min(stock, cantidad);
    }
    carritoService.update(productoId, cantidad, stock);
    actualizarCarrito();
  };

  const handleEliminar = (productoId: number) => {
    carritoService.remove(productoId);
    actualizarCarrito();
  };

  const handleVaciar = () => {
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      carritoService.clear();
      setAppliedCoupon(null); // Limpiar cupón al vaciar carrito
      actualizarCarrito();
    }
  };

  const handleCouponApplied = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  const handleProceedToCheckout = () => {
    // Guardar cupón en localStorage para usarlo en checkout
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
    navigate('/checkout');
  };

  // Calcular totales con descuento
  const subtotal = total;
  const discountAmount = appliedCoupon?.discount || 0;
  const finalTotal = subtotal - discountAmount;

  if (carrito.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Carrito de Compras</h1>
        <p className="text-gray-600 mb-8">Tu carrito está vacío</p>
        <Link
          to="/sensores"
          className="btn-animated bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 inline-block"
        >
          Ver Sensores
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Carrito de Compras</h1>
        <button
          onClick={handleVaciar}
          className="btn-animated text-red-600 hover:text-red-700 font-semibold text-sm sm:text-base whitespace-nowrap"
        >
          Vaciar Carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {carrito.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                {item.imagen || item.imagen_url ? (
                  <img
                    src={getImageUrl(item.imagen_url || item.imagen)}
                    alt={item.nombre}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex items-center justify-center"><span class="text-gray-400 text-xs">Sin imagen</span></div>';
                      }
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Sin imagen</span>
                  </div>
                )}
                <div className="flex-grow">
                  <Link
                    to={`/sensores/${item.id}`}
                    className="text-xl font-semibold hover:text-primary-600"
                  >
                    {item.nombre}
                  </Link>
                  <p className="text-gray-600 text-sm mt-1">{item.descripcion}</p>
                  <p className="text-primary-600 font-bold mt-2">${item.precio}</p>
                  {item.tipo_display && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded mt-1 inline-block">
                      {item.tipo_display}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleActualizarCantidad(item.id, item.cantidad - 1, '-', item.stock)}
                      className="btn-animated px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => handleActualizarCantidad(item.id, item.cantidad + 1, '+', item.stock)}
                      className="btn-animated px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleEliminar(item.id)}
                    className="btn-animated text-red-600 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Resumen</h2>

            {/* Componente de cupón */}
            <CouponInput
              total={subtotal}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              appliedCoupon={appliedCoupon}
            />

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({appliedCoupon.code}):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Envío:</span>
                <span>Gratis</span>
              </div>

              <div className="border-t pt-2 flex justify-between font-bold text-xl">
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="btn-animated w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              Proceder al Pago
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
