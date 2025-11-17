import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productosService, categoriasService } from "../services/api";

const Productos: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    categoria: "",
    estado: "activo",
    search: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoriasService.getAll(),
          productosService.getAll(filtros),
        ]);

        // Manejar diferentes formatos de respuesta de categorías
        const categoriasData = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data.categorias || catRes.data.results || [];

        // Manejar diferentes formatos de respuesta de productos
        const productosData = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data.results || prodRes.data.productos || [];

        setCategorias(categoriasData);
        setProductos(productosData);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setCategorias([]);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filtros]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La búsqueda se maneja automáticamente por el filtro
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Productos</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={filtros.search}
                onChange={(e) =>
                  setFiltros({ ...filtros, search: e.target.value })
                }
                placeholder="Nombre o descripción..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) =>
                  setFiltros({ ...filtros, categoria: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {Array.isArray(categorias) &&
                  categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) =>
                  setFiltros({ ...filtros, estado: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </form>
      </div>

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
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-primary-600">
                    S/.{producto.precio}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      producto.estado === "activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {producto.estado}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <span>Categoría: {producto.categoria_nombre}</span>
                  <span className="ml-2">Stock: {producto.stock}</span>
                </div>
              </div>
            </Link>
          ))}
      </div>

      {Array.isArray(productos) && productos.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No se encontraron productos.
        </p>
      )}
    </div>
  );
};

export default Productos;
