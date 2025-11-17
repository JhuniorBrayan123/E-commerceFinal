import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriasService, productosService } from '../services/api';

const Home: React.FC = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productosDestacados, setProductosDestacados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoriasService.getAll(),
          productosService.activos(),
        ]);
        setCategorias(catRes.data.slice(0, 5));
        setProductosDestacados(prodRes.data.slice(0, 8));
      } catch (error) {
        console.error('Error cargando datos:', error);
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
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20 mb-12 rounded-lg">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Bienvenido a E-Commerce</h1>
          <p className="text-xl mb-8">Encuentra los mejores productos al mejor precio</p>
          <Link
            to="/productos"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Ver Productos
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
        <h2 className="text-3xl font-bold mb-6">Productos Destacados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productosDestacados.map((producto) => (
            <Link
              key={producto.id}
              to={`/productos/${producto.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              {producto.imagen_url ? (
                <img
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{producto.nombre}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{producto.descripcion}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">${producto.precio}</span>
                  <span className="text-sm text-gray-500">Stock: {producto.stock}</span>
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

