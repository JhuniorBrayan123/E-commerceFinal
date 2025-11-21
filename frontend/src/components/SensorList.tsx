import React, { useState, useEffect } from "react";
import "./SensorList.css";
import { carritoService } from "../services/api";
import { useNavigate } from "react-router-dom";
interface Sensor {
  id: number;
  nombre: string;
  tipo: string;
  tipo_display: string;
  marca: string;
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
    tipo: string;
    marca: string;
    disponible: string;
    search: string;
  }>({
    tipo: "",
    marca: "",
    disponible: "",
    search: "",
  });
  const [filterOptions, setFilterOptions] = useState<{
    tipos: { value: string; label: string }[];
    marcas: string[];
  }>({
    tipos: [],
    marcas: [],
  });

  const handleActualizarCantidad = (sensor: Sensor) => {
    carritoService.add(sensor, 1);
  };

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
        if (filters.tipo) params.append("tipo", filters.tipo);
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
      tipo: "",
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
            <label htmlFor="tipo">Tipo de Sensor:</label>
            <select
              id="tipo"
              value={filters.tipo}
              onChange={(e) => handleFilterChange("tipo", e.target.value)}
              className="filter-select"
            >
              <option value="">Todos</option>
              {filterOptions.tipos.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
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
          <div key={sensor.id} className="sensor-card">
            <div className="sensor-header">
              <h3>{sensor.nombre}</h3>
              <span className={`tipo-badge ${sensor.tipo}`}>
                {sensor.tipo_display}
              </span>
            </div>

            <div className="sensor-details">
              <p>
                <strong>Marca:</strong> {sensor.marca}
              </p>
              <p>
                <strong>Modelo:</strong> {sensor.modelo}
              </p>
              <p className="sensor-description">
                <strong>Descripción:</strong> {sensor.descripcion}
              </p>
            </div>

            <div className="sensor-specs">
              <div className="spec">
                <small>
                  <strong>Rango:</strong> {sensor.rango_medicion}
                </small>
              </div>
              <div className="spec">
                <small>
                  <strong>Precisión:</strong> {sensor.precision}
                </small>
              </div>
              <div className="spec">
                <small>
                  <strong>Alimentación:</strong> {sensor.alimentacion}
                </small>
              </div>
              <div className="spec">
                <small>
                  <strong>Comunicación:</strong> {sensor.protocolo_comunicacion}
                </small>
              </div>
            </div>

            <div className="sensor-footer">
              <div className="price-stock">
                <p className="sensor-price">${sensor.precio}</p>
                <p className="sensor-stock">Stock: {sensor.stock}</p>
              </div>
              <button
                className="add-to-cart-btn"
                disabled={!sensor.disponible || sensor.stock === 0}
                onClick={() => handleActualizarCantidad(sensor)}
              >
                {sensor.disponible && sensor.stock > 0
                  ? "Agregar al carrito"
                  : "No disponible"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {sensores.length === 0 && !loading && (
        <div className="no-sensors">
          <p>No hay sensores disponibles con los filtros seleccionados.</p>
          <p>💡 Intenta cambiar los filtros o limpia tu búsqueda.</p>
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
