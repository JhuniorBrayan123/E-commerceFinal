import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productosService, carritoService } from '../services/api';

const ProductoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<any>(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await productosService.getById(parseInt(id!));
        setProducto(res.data);
      } catch (error) {
        console.error('Error cargando producto:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProducto();
    }
  }, [id]);

  const handleAgregarCarrito = () => {
    if (producto && cantidad > 0 && cantidad <= producto.stock) {
      carritoService.add(producto, cantidad);
      alert('Producto agregado al carrito');
      navigate('/carrito');
    } else {
      alert('Cantidad inválida o stock insuficiente');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <button
          onClick={() => navigate('/productos')}
          className="text-primary-600 hover:text-primary-700"
        >
          Volver a productos
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/productos')}
        className="text-primary-600 hover:text-primary-700 mb-4"
      >
        ← Volver a productos
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div>
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400 text-xl">Sin imagen</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4">{producto.nombre}</h1>
            <div className="mb-4">
              <span className="text-4xl font-bold text-primary-600">${producto.precio}</span>
            </div>
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                producto.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {producto.estado}
              </span>
              <span className="ml-4 text-gray-600">
                Categoría: {producto.categoria_nombre}
              </span>
            </div>
            <p className="text-gray-700 mb-6">{producto.descripcion}</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad (Stock disponible: {producto.stock})
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={cantidad <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1)))}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center"
                  min="1"
                  max={producto.stock}
                />
                <button
                  onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={cantidad >= producto.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-lg font-semibold">
                Subtotal: ${(producto.precio * cantidad).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleAgregarCarrito}
              disabled={producto.estado !== 'activo' || producto.stock === 0}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {producto.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;

