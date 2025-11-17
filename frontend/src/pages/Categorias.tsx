import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { categoriasService, productosService } from "../services/api";

const Categorias: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [categoriaActual, setCategoriaActual] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await categoriasService.getAll();
        // Manejar diferentes formatos de respuesta
        const categoriasData = Array.isArray(res.data)
          ? res.data
          : res.data.categorias || res.data.results || [];
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Error cargando categorías:", error);
        setCategorias([]);
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchProductos = async () => {
        try {
          setLoading(true);
          const [catRes, prodRes] = await Promise.all([
            categoriasService.getById(parseInt(id)),
            productosService.porCategoria(parseInt(id)),
          ]);
          setCategoriaActual(catRes.data);
          setProductos(prodRes.data);
        } catch (error) {
          console.error("Error cargando productos:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProductos();
    } else {
      setCategoriaActual(null);
      setProductos([]);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (id && categoriaActual) {
    return (
      <div>
        <div className="mb-6">
          <Link
            to="/categorias"
            className="text-primary-600 hover:text-primary-700"
          >
            ← Volver a categorías
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-4">{categoriaActual.nombre}</h1>
        {categoriaActual.descripcion && (
          <p className="text-gray-600 mb-6">{categoriaActual.descripcion}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.isArray(productos) &&
            productos.map((producto) => (
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
                  <h3 className="text-lg font-semibold mb-2">
                    {producto.nombre}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {producto.descripcion}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary-600">
                      ${producto.precio}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {producto.stock}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
        {Array.isArray(productos) && productos.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            No hay productos en esta categoría.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Categorías</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map((categoria) => (
          <Link
            key={categoria.id}
            to={`/categorias/${categoria.id}`}
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold mb-2">{categoria.nombre}</h2>
            {categoria.descripcion && (
              <p className="text-gray-600">{categoria.descripcion}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categorias;
