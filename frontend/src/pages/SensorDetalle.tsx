import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sensoresService, carritoService } from '../services/api';

const SensorDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState<any>(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensor = async () => {
      try {
        const res = await sensoresService.getById(parseInt(id!));
        setSensor(res.data);
      } catch (error) {
        console.error('Error cargando sensor:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchSensor();
    }
  }, [id]);

  const handleAgregarCarrito = () => {
    if (sensor && cantidad > 0 && cantidad <= sensor.stock) {
      carritoService.add(sensor, cantidad);
      alert('Sensor agregado al carrito');
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

  if (!sensor) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Sensor no encontrado</h2>
        <Link
          to="/sensores"
          className="text-primary-600 hover:text-primary-700"
        >
          Volver a sensores
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/sensores')}
        className="text-primary-600 hover:text-primary-700 mb-4"
      >
        ← Volver a sensores
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div>
            {sensor.imagen_url || sensor.imagen ? (
              <img
                src={sensor.imagen_url || sensor.imagen}
                alt={sensor.nombre}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400 text-xl">Sin imagen</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4">{sensor.nombre}</h1>
            <div className="mb-4">
              <span className="text-4xl font-bold text-primary-600">${sensor.precio}</span>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                sensor.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {sensor.disponible ? 'Disponible' : 'No Disponible'}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                {sensor.tipo_display || sensor.tipo}
              </span>
            </div>
            
            <div className="mb-6 space-y-3">
              <div>
                <strong>Marca:</strong> {sensor.marca}
              </div>
              <div>
                <strong>Modelo:</strong> {sensor.modelo}
              </div>
              <p className="text-gray-700">{sensor.descripcion}</p>
            </div>

            {/* Especificaciones técnicas */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Especificaciones Técnicas</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <strong>Rango de Medición:</strong>
                  <p className="text-gray-600">{sensor.rango_medicion}</p>
                </div>
                <div>
                  <strong>Precisión:</strong>
                  <p className="text-gray-600">{sensor.precision}</p>
                </div>
                <div>
                  <strong>Alimentación:</strong>
                  <p className="text-gray-600">{sensor.alimentacion}</p>
                </div>
                <div>
                  <strong>Protocolo de Comunicación:</strong>
                  <p className="text-gray-600">{sensor.protocolo_comunicacion}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad (Stock disponible: {sensor.stock})
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
                  onChange={(e) => setCantidad(Math.max(1, Math.min(sensor.stock, parseInt(e.target.value) || 1)))}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center"
                  min="1"
                  max={sensor.stock}
                />
                <button
                  onClick={() => setCantidad(Math.min(sensor.stock, cantidad + 1))}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={cantidad >= sensor.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-lg font-semibold">
                Subtotal: ${(parseFloat(sensor.precio) * cantidad).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleAgregarCarrito}
              disabled={!sensor.disponible || sensor.stock === 0}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {sensor.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDetalle;

