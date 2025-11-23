import React, { useState, useEffect, useMemo } from "react";
import "./SensorList.css";

import { Link, useNavigate } from "react-router-dom";
import { carritoService, sensoresService } from "../services/api";

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

interface FilterConfig {
  id: string;
  label: string;
  type: "search" | "select" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

const SensorList: React.FC = () => {
  const navigate = useNavigate();
  const [allSensores, setAllSensores] = useState<Sensor[]>([]);
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuración de filtros disponibles
  const availableFilters: FilterConfig[] = [
    { id: "search", label: "Buscar", type: "search", placeholder: "Nombre, marca, modelo..." },
    { id: "categoria_nombre", label: "Tipo de Sensor", type: "select" },
    { id: "marca", label: "Marca", type: "select" },
    { id: "disponible", label: "Disponibilidad", type: "select", options: [
      { value: "true", label: "Disponibles" },
      { value: "false", label: "No Disponibles" }
    ]},
    { id: "precio_min", label: "Precio Mínimo", type: "number", placeholder: "Min" },
    { id: "precio_max", label: "Precio Máximo", type: "number", placeholder: "Max" },
    { id: "stock_min", label: "Stock Mínimo", type: "number", placeholder: "Min" },
    { id: "rango", label: "Rango de Medición", type: "search", placeholder: "Ej: 0-100%" },
    { id: "modelo", label: "Modelo", type: "search", placeholder: "Buscar por modelo" },
    { id: "protocolo", label: "Protocolo de Comunicación", type: "search", placeholder: "Ej: Digital, I2C" },
    { id: "ordering", label: "Ordenar por", type: "select", options: [
      { value: "-fecha_creacion", label: "Más Recientes" },
      { value: "fecha_creacion", label: "Más Antiguos" },
      { value: "-precio", label: "Precio: Mayor a Menor" },
      { value: "precio", label: "Precio: Menor a Mayor" },
      { value: "nombre", label: "Nombre: A-Z" },
      { value: "-nombre", label: "Nombre: Z-A" },
      { value: "-stock", label: "Stock: Mayor a Menor" },
      { value: "stock", label: "Stock: Menor a Mayor" }
    ]}
  ];

  // Filtros activos por defecto (no se pueden eliminar)
  const defaultFilters = new Set(["search", "ordering"]);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(defaultFilters);

  // Valores de los filtros
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    search: "",
    categoria_nombre: "",
    marca: "",
    disponible: "",
    precio_min: "",
    precio_max: "",
    stock_min: "",
    rango: "",
    modelo: "",
    protocolo: "",
    ordering: "-fecha_creacion"
  });

  const [filterOptions, setFilterOptions] = useState<{
    categorias: { value: number; label: string }[];
    marcas: string[];
    rangos: string[];
    modelos: string[];
    protocolos: string[];
    precio_min: number;
    precio_max: number;
    stock_max: number;
  }>({
    categorias: [],
    marcas: [],
    rangos: [],
    modelos: [],
    protocolos: [],
    precio_min: 0,
    precio_max: 0,
    stock_max: 0,
  });

  // Filtros guardados (Vistas Personalizadas)
  const [savedFilters, setSavedFilters] = useState<Array<{
    id: string;
    name: string;
    activeFilters: Set<string>;
    filterValues: Record<string, string>;
  }>>(() => {
    const saved = localStorage.getItem('sensorSavedFilters');
    return saved ? JSON.parse(saved).map((f: any) => ({
      ...f,
      activeFilters: new Set(f.activeFilters),
    })) : [];
  });

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");

  const handleActualizarCantidad = (sensor: Sensor) => {
    carritoService.add(sensor, 1, sensor.stock);
  };

  // Cargar opciones de filtros
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await sensoresService.getFilters();
        if (response.data) {
          setFilterOptions(response.data);
        }
      } catch (err) {
        console.error("Error cargando filtros:", err);
      }
    };

    fetchFilters();
  }, []);

  // Cargar sensores
  useEffect(() => {
    const fetchSensores = async () => {
      setLoading(true);
      setError(null);
      try {

        const response = await sensoresService.getAll();
        const data = response.data;
        // La respuesta puede venir como { sensores: [...] } o directamente como array
        const sensoresData = data.sensores || data.results || data || [];
        setAllSensores(sensoresData);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setAllSensores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSensores();
  }, []);

  // Aplicar filtros usando useMemo
  const sensoresFiltrados = useMemo(() => {
    let filtered = [...allSensores];

    // Aplicar búsqueda (por primera letra o contiene)
    if (activeFilters.has("search") && filterValues.search) {
      const searchTerm = filterValues.search.toLowerCase();
      filtered = filtered.filter(sensor => {
        const nombre = sensor.nombre?.toLowerCase() || "";
        const marca = sensor.marca?.toLowerCase() || "";
        const modelo = sensor.modelo?.toLowerCase() || "";
        // Buscar por primera letra o contiene
        return nombre.startsWith(searchTerm) || nombre.includes(searchTerm) ||
               marca.startsWith(searchTerm) || marca.includes(searchTerm) ||
               modelo.startsWith(searchTerm) || modelo.includes(searchTerm);
      });
    }

    // Aplicar filtro de tipo
    if (activeFilters.has("categoria") && filterValues.categoria_nombre) {
      filtered = filtered.filter(sensor => sensor.categoria_nombre === filterValues.categoria_nombre);
    }

    // Aplicar filtro de marca
    if (activeFilters.has("marca") && filterValues.marca) {
      filtered = filtered.filter(sensor => 
        sensor.marca?.toLowerCase().includes(filterValues.marca.toLowerCase())
      );
    }

    // Aplicar filtro de disponibilidad
    if (activeFilters.has("disponible") && filterValues.disponible) {
      const disponible = filterValues.disponible === "true";
      filtered = filtered.filter(sensor => sensor.disponible === disponible);
    }

    // Aplicar filtro de precio mínimo
    if (activeFilters.has("precio_min") && filterValues.precio_min) {
      const precioMin = parseFloat(filterValues.precio_min);
      if (!isNaN(precioMin)) {
        filtered = filtered.filter(sensor => {
          const precio = parseFloat(sensor.precio);
          return !isNaN(precio) && precio >= precioMin;
        });
      }
    }

    // Aplicar filtro de precio máximo
    if (activeFilters.has("precio_max") && filterValues.precio_max) {
      const precioMax = parseFloat(filterValues.precio_max);
      if (!isNaN(precioMax)) {
        filtered = filtered.filter(sensor => {
          const precio = parseFloat(sensor.precio);
          return !isNaN(precio) && precio <= precioMax;
        });
      }
    }

    // Aplicar filtro de stock mínimo
    if (activeFilters.has("stock_min") && filterValues.stock_min) {
      const stockMin = parseInt(filterValues.stock_min);
      if (!isNaN(stockMin)) {
        filtered = filtered.filter(sensor => sensor.stock >= stockMin);
      }
    }

    // Aplicar filtro de rango
    if (activeFilters.has("rango") && filterValues.rango) {
      filtered = filtered.filter(sensor =>
        sensor.rango_medicion?.toLowerCase().includes(filterValues.rango.toLowerCase())
      );
    }

    // Aplicar filtro de modelo
    if (activeFilters.has("modelo") && filterValues.modelo) {
      filtered = filtered.filter(sensor =>
        sensor.modelo?.toLowerCase().includes(filterValues.modelo.toLowerCase())
      );
    }

    // Aplicar filtro de protocolo
    if (activeFilters.has("protocolo") && filterValues.protocolo) {
      filtered = filtered.filter(sensor =>
        sensor.protocolo_comunicacion?.toLowerCase().includes(filterValues.protocolo.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    if (activeFilters.has("ordering") && filterValues.ordering) {
      const order = filterValues.ordering;
      filtered.sort((a, b) => {
        if (order === "-fecha_creacion" || order === "fecha_creacion") {
          const dateA = new Date(a.fecha_creacion || 0).getTime();
          const dateB = new Date(b.fecha_creacion || 0).getTime();
          return order === "-fecha_creacion" ? dateB - dateA : dateA - dateB;
        } else if (order === "-precio" || order === "precio") {
          const precioA = parseFloat(a.precio) || 0;
          const precioB = parseFloat(b.precio) || 0;
          return order === "-precio" ? precioB - precioA : precioA - precioB;
        } else if (order === "-nombre" || order === "nombre") {
          return order === "-nombre" 
            ? (b.nombre || "").localeCompare(a.nombre || "")
            : (a.nombre || "").localeCompare(b.nombre || "");
        } else if (order === "-stock" || order === "stock") {
          return order === "-stock" ? b.stock - a.stock : a.stock - b.stock;
        }
        return 0;
      });
    }

    return filtered;
  }, [allSensores, activeFilters, filterValues]);

  // Actualizar sensores cuando cambien los filtros
  useEffect(() => {
    setSensores(sensoresFiltrados);
  }, [sensoresFiltrados]);

  // Manejar activación/desactivación de filtros
  const handleToggleFilter = (filterId: string) => {
    // No permitir eliminar filtros por defecto
    if (defaultFilters.has(filterId)) {
      return;
    }
    setActiveFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filterId)) {
        newSet.delete(filterId);
      } else {
        newSet.add(filterId);
      }
      return newSet;
    });
  };

  // Manejar cambios en los valores de los filtros
  const handleFilterValueChange = (filterId: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  // Limpiar todos los filtros (excepto los por defecto)
  const handleClearFilters = () => {

    setActiveFilters(defaultFilters);
    setFilterValues({
      search: "",
      categoria_nombre: "",

      marca: "",
      disponible: "",
      precio_min: "",
      precio_max: "",
      stock_min: "",
      rango: "",
      modelo: "",
      protocolo: "",
      ordering: "-fecha_creacion"
    });
  };

  // Guardar filtro personalizado
  const handleSaveFilter = () => {
    if (!saveFilterName.trim()) {
      alert("Por favor ingresa un nombre para la vista personalizada");
      return;
    }

    const newSavedFilter = {
      id: Date.now().toString(),
      name: saveFilterName.trim(),
      // Guardamos como Set en el estado PARA EVITAR MEZCLAS (fix del merge)
      activeFilters: new Set(activeFilters),
      filterValues: { ...filterValues }
    };

    const updated = [...savedFilters, newSavedFilter];
    setSavedFilters(updated);
    // Para localStorage serializamos a array
    localStorage.setItem('sensorSavedFilters', JSON.stringify(updated.map(f => ({
      ...f,
      activeFilters: Array.from(f.activeFilters)
    }))));

    setSaveFilterName("");
    setShowSaveDialog(false);
  };

  // Cargar filtro guardado
  const handleLoadSavedFilter = (savedFilter: typeof savedFilters[0]) => {
    // savedFilter.activeFilters puede ser Set o array dependiendo de cómo vino, new Set() normaliza
    setActiveFilters(new Set(savedFilter.activeFilters as any));
    setFilterValues(savedFilter.filterValues);
  };

  // Eliminar filtro guardado
  const handleDeleteSavedFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('sensorSavedFilters', JSON.stringify(updated.map(f => ({
      ...f,
      activeFilters: Array.from(f.activeFilters)
    }))));
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
              value={filterValues.search}
              onChange={(e) => handleFilterValueChange("search", e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="categoria_nombre">Tipo de Sensor:</label>
            <select
              id="categoria_nombre"
              value={filterValues.categoria_nombre}
              onChange={(e) => handleFilterValueChange("categoria_nombre", e.target.value)}
              className="filter-select"
            >
              <option value="">Todos</option>
              {filterOptions.categorias.map((categoria_nombre) => (
                <option key={categoria_nombre.value} value={String(categoria_nombre.value)}>
                  {categoria_nombre.label}
                </option>
              ))}
            </select>
          </div>

        <div className="filters-header">
          <h3>Filtros</h3>
          <div className="filters-actions">
            <button onClick={handleClearFilters} className="clear-filters-btn">
              Restablecer
            </button>
            <button 
              onClick={() => setShowSaveDialog(true)} 
              className="save-filter-btn"
            >
              💾 Guardar Vista
            </button>

          </div>
        </div>

        {/* Botones para agregar filtros */}
        <div className="filter-available-list">
          <span style={{ fontWeight: 600, marginRight: '8px', alignSelf: 'center' }}>
            Agregar filtros:
          </span>
          {availableFilters
            .filter(filter => !activeFilters.has(filter.id))
            .map(filter => (
              <button
                key={filter.id}
                onClick={() => handleToggleFilter(filter.id)}
                className="filter-available-btn"
              >
                + {filter.label}
              </button>
            ))}
          {availableFilters.filter(filter => !activeFilters.has(filter.id)).length === 0 && (
            <span style={{ color: '#666', fontStyle: 'italic' }}>
              Todos los filtros están activos
            </span>
          )}
        </div>

        {/* Filtros activos */}
        {Array.from(activeFilters).length > 0 && (
          <div className="filters-grid">
            {Array.from(activeFilters).map(filterId => {
              const filter = availableFilters.find(f => f.id === filterId);
              if (!filter) return null;
              
              const isDefault = defaultFilters.has(filterId);
              
              return (
                <div 
                  key={filterId} 
                  className={`filter-group-wrapper ${isDefault ? 'required' : ''}`}
                >
                  <div className="filter-group" style={{ flex: 1, minWidth: 0 }}>
                    <label htmlFor={filterId}>
                      {filter.label}
                      {isDefault && (
                        <span className="required-badge">(requerido)</span>
                      )}
                    </label>
                    {filter.type === "search" ? (
                      <input
                        id={filterId}
                        type="text"
                        value={filterValues[filterId] || ""}
                        onChange={(e) => handleFilterValueChange(filterId, e.target.value)}
                        placeholder={filter.placeholder || "Buscar..."}
                        className="filter-input"
                      />
                    ) : filter.type === "number" ? (
                      <input
                        id={filterId}
                        type="number"
                        value={filterValues[filterId] || ""}
                        onChange={(e) => handleFilterValueChange(filterId, e.target.value)}
                        placeholder={filter.placeholder || ""}
                        className="filter-input"
                        min="0"
                        step={filterId.includes("precio") ? "0.01" : "1"}
                      />
                    ) : (
                      <select
                        id={filterId}
                        value={filterValues[filterId] || ""}
                        onChange={(e) => handleFilterValueChange(filterId, e.target.value)}
                        className="filter-select"
                      >
                        {filterId === "tipo" && <option value="">Todos</option>}
                        {filterId === "marca" && <option value="">Todas</option>}
                        {filterId === "disponible" && <option value="">Todos</option>}
                        {filterId === "tipo" && filterOptions.categorias.map((tipo) => (
                          <option key={tipo.value} value={String(tipo.value)}>
                            {tipo.label}
                          </option>
                        ))}
                        {filterId === "marca" && filterOptions.marcas.map((marca, index) => (
                          <option key={`${marca}-${index}`} value={marca}>
                            {marca}
                          </option>
                        ))}
                        {filter.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {!isDefault && (
                    <button
                      onClick={() => handleToggleFilter(filterId)}
                      className="filter-remove-btn"
                      title="Remover filtro"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Diálogo para guardar filtro */}
        {showSaveDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              minWidth: '300px',
              maxWidth: '500px'
            }}>
              <h4 style={{ marginBottom: '16px', color: '#2c5530' }}>
                Guardar Vista Personalizada
              </h4>
              <input
                type="text"
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
                placeholder="Nombre de la vista (ej: Sensores económicos)"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  fontSize: '0.95em'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveFilter();
                  }
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveFilterName("");
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveFilter}
                  style={{
                    padding: '8px 16px',
                    background: '#2c5530',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros guardados */}
        {savedFilters.length > 0 && (
          <div className="saved-filters-section">
            <h4 style={{ marginBottom: '10px', color: '#2c5530', fontSize: '1.1em' }}>
              Vistas Personalizadas:
            </h4>
            <div className="saved-filters-list">
              {savedFilters.map(savedFilter => (
                <div key={savedFilter.id} className="saved-filter-chip">
                  <span>{savedFilter.name}</span>
                  <button
                    onClick={() => handleLoadSavedFilter(savedFilter)}
                    style={{
                      background: '#2c5530',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontSize: '0.85em'
                    }}
                    title="Cargar vista"
                  >
                    Cargar
                  </button>
                  <button
                    onClick={() => handleDeleteSavedFilter(savedFilter.id)}
                    title="Eliminar vista"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
                  className="w-full h-48 object-cover"
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
    </div>
  );
};

export default SensorList;
