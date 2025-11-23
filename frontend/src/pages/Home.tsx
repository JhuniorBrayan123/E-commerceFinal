import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriasService, sensoresService } from '../services/api';

const Home: React.FC = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [sensoresDestacados, setSensoresDestacados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, sensoresRes] = await Promise.all([
          categoriasService.getAll(),
          sensoresService.getAll({ disponible: 'true', ordering: '-fecha_creacion' }),
        ]);
        
        // Manejar diferentes formatos de respuesta para categorías
        const categoriasData = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.categorias || catRes.data?.results || [];
        setCategorias(Array.isArray(categoriasData) ? categoriasData.slice(0, 5) : []);
        
        // Obtener los primeros 8 sensores disponibles
        const sensoresData = sensoresRes.data?.sensores || sensoresRes.data?.results || sensoresRes.data || [];
        setSensoresDestacados(Array.isArray(sensoresData) ? sensoresData.slice(0, 8) : []);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setCategorias([]);
        setSensoresDestacados([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-gradient-to-r from-primary-900 to-secondary-800 text-white py-20 mb-12 rounded-lg">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Bienvenido a AGROCODE</h1>
          <p className="text-xl mb-8">Encuentra los mejores sensores al mejor precio</p>
          <Link
            to="/sensores"
            className="bg-white text-primary-800  px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Ver Sensores
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Categorías</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categorias.map((categoria) => (
            <Link
              key={categoria.id}
              to={`/categorias/${categoria.id}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
            >
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold">{categoria.nombre}</h3>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            to="/categorias"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Ver todas las categorías →
          </Link>
        </div>
      </section>
      
      <section>
        <h2 className="text-3xl font-bold mb-6">Sensores Destacados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sensoresDestacados.map((sensor) => (
            <Link
              key={sensor.id}
              to={`/sensores/${sensor.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              {sensor.imagen_url || sensor.imagen ? (
                <img
                  src={sensor.imagen_url || sensor.imagen}
                  alt={sensor.nombre}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{sensor.nombre}</h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {sensor.tipo_display || sensor.tipo}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{sensor.descripcion}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">${sensor.precio}</span>
                  <span className="text-sm text-gray-500">Stock: {sensor.stock}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {sensor.marca} - {sensor.modelo}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

