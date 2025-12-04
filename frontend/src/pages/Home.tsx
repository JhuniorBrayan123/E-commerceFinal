import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriasService, sensoresService } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="bg-gradient-to-r from-primary-900 to-secondary-800 text-white py-12 sm:py-16 md:py-20 mb-8 sm:mb-12 rounded-lg">
        <div className="text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Bienvenido a AGROCODE</h1>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8">Encuentra los mejores sensores al mejor precio</p>
          <Link
            to="/sensores"
            className="btn-animated bg-white text-primary-800 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Ver Sensores
          </Link >

        </div>
      </section>

      <section className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Recomendados para ti</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {categorias.map((categoria) => (
            <Link
              key={categoria.id}
              to={`/categorias/${categoria.id}`}
              className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-4">📦</div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold break-words">{categoria.nombre}</h3>
            </Link>
          ))}
        </div>
        <div className="text-center mt-4 sm:mt-6">
          <Link
            to="/categorias"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Ver todas las categorías →
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Todo nuestro catalogo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sensoresDestacados.map((sensor) => (
            <Link
              key={sensor.id}
              to={`/sensores/${sensor.id}`}
              className="product-card bg-white rounded-lg shadow-md overflow-hidden"
            >
              {sensor.imagen_url || sensor.imagen ? (
                <div className="product-card-image">
                  <img
                    src={getImageUrl(sensor.imagen_url || sensor.imagen)}
                    alt={sensor.nombre}
                    className="w-full h-40 sm:h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ESin imagen%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Sin imagen</span>
                </div>
              )}
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1 sm:gap-0">
                  <h3 className="text-base sm:text-lg font-semibold line-clamp-2">{sensor.nombre}</h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded self-start sm:self-auto">
                    {sensor.tipo_display || sensor.tipo}
                  </span>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{sensor.descripcion}</p>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="text-xl sm:text-2xl font-bold text-primary-600">S/ {sensor.precio}</span>
                  <span className="text-xs sm:text-sm text-gray-500">Stock: {sensor.stock}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-1">
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

