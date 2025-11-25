import React, { useState, useEffect, useMemo } from "react";
import "./SensorList.css";

import { Link, useParams, useNavigate } from "react-router-dom";
import { carritoService, sensoresService, categoriasService } from "../services/api";

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
  const { id } = useParams<{ id: string }>();


  // Configuración de filtros disponibles
  const availableFilters: FilterConfig[] = [
    { id: "search", label: "Buscar", type: "search", placeholder: "Nombre, marca, modelo..." },
    { id: "categoria_nombre", label: "Tipo de Sensor", type: "select" },
    { id: "marca", label: "Marca", type: "select" },
    {
      id: "disponible", label: "Disponibilidad", type: "select", options: [
        { value: "true", label: "Disponibles" },
        { value: "false", label: "No Disponibles" }
      ]
    },
    { id: "precio_min", label: "Precio Mínimo", type: "number", placeholder: "Min" },
    { id: "precio_max", label: "Precio Máximo", type: "number", placeholder: "Max" },
    { id: "stock_min", label: "Stock Mínimo", type: "number", placeholder: "Min" },
    { id: "rango", label: "Rango de Medición", type: "search", placeholder: "Ej: 0-100%" },
    { id: "modelo", label: "Modelo", type: "search", placeholder: "Buscar por modelo" },
    { id: "protocolo", label: "Protocolo de Comunicación", type: "search", placeholder: "Ej: Digital, I2C" },
    {
      id: "ordering", label: "Ordenar por", type: "select", options: [
        { value: "-fecha_creacion", label: "Más Recientes" },
        { value: "fecha_creacion", label: "Más Antiguos" },
        { value: "-precio", label: "Precio: Mayor a Menor" },
        { value: "precio", label: "Precio: Menor a Mayor" },
        { value: "nombre", label: "Nombre: A-Z" },
        { value: "-nombre", label: "Nombre: Z-A" },
        { value: "-stock", label: "Stock: Mayor a Menor" },
        { value: "stock", label: "Stock: Menor a Mayor" }
      ]
    }
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
        let response;
        if (id) {
          response = await categoriasService.getProductos(parseInt(id));
        } else {
          response = await sensoresService.getAll();
        }

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
  }, [id]);

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
    <div className="sensor-list container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de Filtros */}
        <div className="lg:col-span-1">
          <div className="filters-section bg-white p-6 rounded-lg shadow-sm sticky top-4">
            <h3 className="text-xl font-bold text-green-900 mb-4">Filtros</h3>

            <div className="flex flex-col gap-6">
              {/* Buscador */}
              <div className="filter-group">
                <label htmlFor="search" className="font-semibold text-gray-700 mb-2 block">Buscar</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Nombre, marca, modelo..."
                  value={filterValues.search}
                  onChange={(e) => handleFilterValueChange("search", e.target.value)}
                  className="filter-input w-full"
                />
              </div>

              {/* Tipo de Sensor */}
              <div className="filter-group">
                <label htmlFor="categoria_nombre" className="font-semibold text-gray-700 mb-2 block">Tipo de Sensor</label>
                <select
                  id="categoria_nombre"
                  value={filterValues.categoria_nombre}
                  onChange={(e) => handleFilterValueChange("categoria_nombre", e.target.value)}
                  className="filter-select w-full"
                >
                  <option value="">Todos</option>
                  {filterOptions.categorias.map((categoria_nombre) => (
                    <option key={categoria_nombre.value} value={String(categoria_nombre.value)}>
                      {categoria_nombre.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtros Activos Dinámicos */}
              {Array.from(activeFilters).map(filterId => {
                const filter = availableFilters.find(f => f.id === filterId);
                if (!filter || defaultFilters.has(filterId)) return null; // Skip default filters here as they are handled above or hidden

                return (
                  <div key={filterId} className="filter-group relative">
                    <label htmlFor={filterId} className="font-semibold text-gray-700 mb-2 block">
                      {filter.label}
                    </label>
                    <div className="flex gap-2">
                      {filter.type === "search" ? (
                        <input
                          id={filterId}
                          type="text"
                          value={filterValues[filterId] || ""}
                          onChange={(e) => handleFilterValueChange(filterId, e.target.value)}
                          placeholder={filter.placeholder || "Buscar..."}
                          className="filter-input w-full"
                        />
                      ) : filter.type === "number" ? (
                        <input
                          id={filterId}
                          type="number"
                          value={filterValues[filterId] || ""}
                          onChange={(e) => handleFilterValueChange(filterId, e.target.value)}
                          placeholder={filter.placeholder || ""}
                          className="filter-input w-full"
                          min="0"
                          step={filterId.includes("precio") ? "0.01" : "1"}
                        />
                      ) : (
                        <select
                          id={filterId}
                          value={filterValues[filterId] || ""}
                          onChange={(e) => handleFilterValueChange(filterId, e.target.value)}
                          className="filter-select w-full"
                        >
                          {filterId === "tipo" && <option value="">Todos</option>}
                          {filterId === "marca" && <option value="">Todas</option>}
                          {filterId === "disponible" && <option value="">Todos</option>}
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
                      <button
                        onClick={() => handleToggleFilter(filterId)}
                        className="text-red-500 hover:text-red-700 font-bold px-2"
                        title="Remover filtro"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Botones de Acción de Filtros */}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <button onClick={handleClearFilters} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm font-medium">
                    Restablecer
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex-1 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition text-sm font-medium"
                  >
                    Guardar Vista
                  </button>
                </div>

                {/* Agregar más filtros */}
                <div className="mt-2">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Agregar filtros:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters
                      .filter(filter => !activeFilters.has(filter.id))
                      .map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => handleToggleFilter(filter.id)}
                          className="px-3 py-1 text-xs border border-green-600 text-green-700 rounded-full hover:bg-green-50 transition"
                        >
                          + {filter.label}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Vistas Guardadas */}
              {savedFilters.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Vistas Guardadas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {savedFilters.map(savedFilter => (
                      <div key={savedFilter.id} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200">
                        <span className="truncate max-w-[100px]">{savedFilter.name}</span>
                        <button
                          onClick={() => handleLoadSavedFilter(savedFilter)}
                          className="hover:text-blue-900 font-bold"
                          title="Cargar"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleDeleteSavedFilter(savedFilter.id)}
                          className="hover:text-red-600 font-bold ml-1"
                          title="Eliminar"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="lg:col-span-3">
          {/* Grid de Sensores */}
          <div className="sensors-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {sensores.map((sensor) => (
              <Link
                key={sensor.id}
                to={`/sensores/${sensor.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition flex flex-col h-full"
              >
                {sensor.imagen ? (
                  <img
                    src={sensor.imagen}
                    alt={sensor.nombre}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="mb-2">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={sensor.nombre}>{sensor.nombre}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 whitespace-nowrap`}>
                        {sensor.categoria_nombre}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4 flex-grow">
                    <p><strong>Marca:</strong> {sensor.marca}</p>
                    <p><strong>Modelo:</strong> {sensor.modelo}</p>
                    <p className="line-clamp-2 mt-1">{sensor.descripcion}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-end mb-3">
                      <p className="text-xl font-bold text-gray-900">S/. {sensor.precio}</p>
                      <p className="text-sm text-gray-500">Stock: {sensor.stock}</p>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleActualizarCantidad(sensor);
                          navigate("/carrito");
                        }}
                        className="flex-1 bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-green-800 transition text-center"
                      >
                        Agregar
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/sensores/${sensor.id}`);
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-300 transition text-center"
                      >
                        Detalles
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mensajes de Estado */}
          {sensores.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm mt-6">
              <p className="text-gray-500 text-lg">No hay sensores disponibles con los filtros seleccionados.</p>
              <button onClick={handleClearFilters} className="mt-4 text-green-700 font-semibold hover:underline">
                Limpiar filtros
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>Total de sensores: <strong>{sensores.length}</strong></p>
          </div>
        </div>
      </div>

      {/* Modal de Guardar Filtro (Mantenido igual pero con estilos inline/clases) */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h4 className="text-lg font-bold text-green-900 mb-4">Guardar Vista Personalizada</h4>
            <input
              type="text"
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              placeholder="Nombre de la vista (ej: Sensores económicos)"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSaveFilter();
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveFilterName("");
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFilter}
                className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorList;
