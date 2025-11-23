import React, { useState, useEffect } from "react";
import "./SensorList.css";
import { carritoService } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
interface Sensor {
  id: number;
  nombre: string;
  categoria_nombre: string;
  categoria: number;
  marca: string;
  imagen: string | null;
  modelo: string;
  precio: string;
  descripcion: string;
  rango_medicion: string;
  precision: string;
  alimentacion: string;
  protocolo_comunicacion: string;
  stock: number;
  disponible: boolean;
  fecha_creacion: string;
}

const SensorList: React.FC = () => {
  const navigate = useNavigate(); // ← AQUÍ
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    categoria_nombre: string;
    marca: string;
    disponible: string;
    search: string;
  }>({
    categoria_nombre: "",
    marca: "",
    disponible: "",
    search: "",
  });
  const [filterOptions, setFilterOptions] = useState<{
    categorias: { value: string; label: string }[];
    marcas: string[];
  }>({
    categorias: [],
    marcas: [],
  });


  // Cargar opciones de filtros
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/filters/");
        if (!response.ok) {
          throw new Error("Error al cargar filtros");
        }
        const data = await response.json();
        setFilterOptions(data);
      } catch (err) {
        console.error("Error cargando filtros:", err);
      }
    };

    fetchFilters();
  }, []);

  // Cargar sensores
  useEffect(() => {
    const fetchSensores = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.categoria_nombre) params.append("categoria", filters.categoria_nombre);
        if (filters.marca) params.append("marca", filters.marca);
        if (filters.disponible) params.append("disponible", filters.disponible);
        if (filters.search) params.append("search", filters.search);

        const response = await fetch(
          `http://localhost:8000/api/sensores/?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("Error al cargar sensores");
        }
        const data = await response.json();
        setSensores(data.sensores);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchSensores();
  }, [filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      categoria_nombre: "",
      marca: "",
      disponible: "",
      search: "",
    });
  };

  if (loading) return <div className="loading">Cargando sensores...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="sensor-list">
      {/* Filtros */}
      <div className="filters-section">
        <h3>Filtros</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="search">Buscar:</label>
            <input
              id="search"
              type="text"
              placeholder="Nombre, marca, modelo..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="categoria_nombre">Tipo de Sensor:</label>
            <select
              id="categoria_nombre"
              value={filters.categoria_nombre}
              onChange={(e) => handleFilterChange("categoria_nombre", e.target.value)}
              className="filter-select"
            >
              <option value="">Todos</option>
              {filterOptions.categorias.map((categoria_nombre) => (
                <option key={categoria_nombre.value} value={categoria_nombre.value}>
                  {categoria_nombre.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="marca">Marca:</label>
            <select
              id="marca"
              value={filters.marca}
              onChange={(e) => handleFilterChange("marca", e.target.value)}
              className="filter-select"
            >
              <option value="">Todas</option>
              {filterOptions.marcas.map((marca) => (
                <option key={marca} value={marca}>
                  {marca}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="disponible">Disponibilidad:</label>
            <select
              id="disponible"
              value={filters.disponible}
              onChange={(e) => handleFilterChange("disponible", e.target.value)}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="true">Disponibles</option>
              <option value="false">No Disponibles</option>
            </select>
          </div>

          <button onClick={handleClearFilters} className="clear-filters-btn">
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Grid de sensores */}
      <div className="sensors-grid">
        {sensores.map((sensor) => (
          <Link
            key={sensor.id}
            to={`/sensores/${sensor.id}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition"
          >
            {sensor.imagen ? (
                <img
                  src={sensor.imagen}
                  alt={sensor.nombre}
                  className="w-full h-48 object-cove"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center ">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
            )}
            <div className="sensor-card">
              <div className="sensor-header">
                <h3>{sensor.nombre}</h3>
                <span className={`tipo-badge cat-${sensor.categoria}`}>
                  {sensor.categoria_nombre}
                </span>
              </div>

              <div className="sensor-details">
                <p>
                  <strong>Marca:</strong> {sensor.marca}
                </p>
                <p>
                  <strong>Modelo:</strong> {sensor.modelo}
                </p>
                <p className="sensor-description line-clamp-2">
                  <strong>Descripción:</strong> {sensor.descripcion}
                </p>
              </div>

              <div className="sensor-footer">
                <div className="price-stock">
                  <p className="sensor-price">S/. {sensor.precio}</p>
                  <p className="sensor-stock">Stock: {sensor.stock}</p>
                </div>
              </div>

            </div>
              
          </Link>
          
        ))}
      </div>

      {sensores.length === 0 && !loading && (
        <div className="no-sensors">
          <p>No hay sensores disponibles con los filtros seleccionados.</p>
          <p>Intenta cambiar los filtros o limpia tu búsqueda.</p>
        </div>
      )}

      <div className="sensors-summary">
        <p>
          Total de sensores: <strong>{sensores.length}</strong>
        </p>
      </div>
    </div>
  );
};

export default SensorList;
