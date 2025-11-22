import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { categoriasService } from "../services/api";

interface FilterConfig {
  id: string;
  label: string;
  type: "search" | "select";
  options?: { value: string; label: string }[];
}

const Categorias: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaActual, setCategoriaActual] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Configuración de filtros disponibles
  const availableFilters: FilterConfig[] = [
    { id: "search_nombre", label: "Buscar por Nombre", type: "search" },
    { id: "search_descripcion", label: "Buscar por Descripción", type: "search" },
    { id: "orden_nombre", label: "Ordenar por Nombre", type: "select", options: [
      { value: "nombre", label: "A-Z" },
      { value: "-nombre", label: "Z-A" }
    ]},
    { id: "orden_fecha", label: "Ordenar por Fecha", type: "select", options: [
      { value: "-fecha_creacion", label: "Más Recientes" },
      { value: "fecha_creacion", label: "Más Antiguos" }
    ]}
  ];

  // Filtros activos por defecto (no se pueden eliminar)
  const defaultFilters = new Set(["search_nombre", "orden_nombre"]);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(defaultFilters);

  // Valores de los filtros
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    search_nombre: "",
    search_descripcion: "",
    orden_nombre: "nombre",
    orden_fecha: "-fecha_creacion"
  });

  // Filtros guardados (Vistas Personalizadas)
  const [savedFilters, setSavedFilters] = useState<Array<{
    id: string;
    name: string;
    activeFilters: Set<string>;
    filterValues: Record<string, string>;
  }>>(() => {
    try {
      const saved = localStorage.getItem('categoriaSavedFilters');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((f: any) => ({
          id: f.id,
          name: f.name,
          activeFilters: new Set(f.activeFilters || []),
          filterValues: f.filterValues || {},
        }));
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
    return [];
  });

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");

  const [allCategorias, setAllCategorias] = useState<any[]>([]);

  // Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        const res = await categoriasService.getAll();
        // Manejar diferentes formatos de respuesta
        const categoriasData = Array.isArray(res.data)
          ? res.data
          : res.data.categorias || res.data.results || [];
        setAllCategorias(categoriasData);
      } catch (error) {
        console.error("Error cargando categorías:", error);
        setAllCategorias([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategorias();
  }, []);

  // Aplicar filtros usando useMemo
  const categoriasFiltradas = useMemo(() => {
    let filtered = [...allCategorias];

    // Aplicar búsqueda por nombre (por primera letra o contiene)
    if (activeFilters.has("search_nombre") && filterValues.search_nombre) {
      const searchTerm = filterValues.search_nombre.toLowerCase();
      filtered = filtered.filter(cat => {
        const nombre = cat.nombre?.toLowerCase() || "";
        // Buscar por primera letra o contiene
        return nombre.startsWith(searchTerm) || nombre.includes(searchTerm);
      });
    }

    // Aplicar búsqueda por descripción (por primera letra o contiene)
    if (activeFilters.has("search_descripcion") && filterValues.search_descripcion) {
      const searchTerm = filterValues.search_descripcion.toLowerCase();
      filtered = filtered.filter(cat => {
        const descripcion = cat.descripcion?.toLowerCase() || "";
        // Buscar por primera letra o contiene
        return descripcion.startsWith(searchTerm) || descripcion.includes(searchTerm);
      });
    }

    // Aplicar ordenamiento
    if (activeFilters.has("orden_nombre")) {
      const order = filterValues.orden_nombre;
      filtered.sort((a, b) => {
        if (order === "nombre") {
          return (a.nombre || "").localeCompare(b.nombre || "");
        } else {
          return (b.nombre || "").localeCompare(a.nombre || "");
        }
      });
    } else if (activeFilters.has("orden_fecha")) {
      const order = filterValues.orden_fecha;
      filtered.sort((a, b) => {
        const dateA = new Date(a.fecha_creacion || 0).getTime();
        const dateB = new Date(b.fecha_creacion || 0).getTime();
        return order === "-fecha_creacion" ? dateB - dateA : dateA - dateB;
      });
    }

    return filtered;
  }, [allCategorias, activeFilters, filterValues]);

  // Actualizar categorías cuando cambien los filtros
  useEffect(() => {
    setCategorias(categoriasFiltradas);
  }, [categoriasFiltradas]);

  useEffect(() => {
    if (id) {
      const fetchCategoria = async () => {
        try {
          setLoading(true);
          const catRes = await categoriasService.getById(parseInt(id));
          setCategoriaActual(catRes.data);
        } catch (error) {
          console.error("Error cargando categoría:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCategoria();
    } else {
      setCategoriaActual(null);
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
      search_nombre: "",
      search_descripcion: "",
      orden_nombre: "nombre",
      orden_fecha: "-fecha_creacion"
    });
  };

  // Guardar filtro personalizado
  const handleSaveFilter = () => {
    if (!saveFilterName.trim()) {
      alert("Por favor ingresa un nombre para la vista personalizada");
      return;
    }

    const newSavedFilter: {
      id: string;
      name: string;
      activeFilters: Set<string>;
      filterValues: Record<string, string>;
    } = {
      id: Date.now().toString(),
      name: saveFilterName.trim(),
      activeFilters: new Set(activeFilters),
      filterValues: { ...filterValues }
    };

    const updated = [...savedFilters, newSavedFilter];
    setSavedFilters(updated);
    localStorage.setItem('categoriaSavedFilters', JSON.stringify(updated.map(f => ({
      ...f,
      activeFilters: Array.from(f.activeFilters)
    }))));
    
    setSaveFilterName("");
    setShowSaveDialog(false);
  };

  // Cargar filtro guardado
  const handleLoadSavedFilter = (savedFilter: typeof savedFilters[0]) => {
    setActiveFilters(new Set(savedFilter.activeFilters));
    setFilterValues(savedFilter.filterValues);
  };

  // Eliminar filtro guardado
  const handleDeleteSavedFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('categoriaSavedFilters', JSON.stringify(updated.map(f => ({
      ...f,
      activeFilters: Array.from(f.activeFilters)
    }))));
  };

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
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <p className="text-blue-800">
            <strong>ℹ️ Nota:</strong> Los productos han sido reemplazados por sensores.
            Para ver los sensores disponibles, por favor visita la sección de Sensores.
          </p>
          <button
            onClick={() => navigate('/sensores')}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Ver Sensores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Categorías</h1>
      
      {/* Selector de filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h2 className="text-xl font-semibold">Filtros</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
            >
              Restablecer
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-semibold"
            >
              💾 Guardar Vista
            </button>
          </div>
        </div>
        
        {/* Botones para agregar filtros */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-gray-700">Agregar filtros:</span>
            {availableFilters
              .filter(filter => !activeFilters.has(filter.id))
              .map(filter => (
                <button
                  key={filter.id}
                  onClick={() => handleToggleFilter(filter.id)}
                  className="px-4 py-2 bg-white border-2 border-primary-600 text-primary-600 rounded-full hover:bg-primary-600 hover:text-white transition text-sm font-medium"
                >
                  + {filter.label}
                </button>
              ))}
            {availableFilters.filter(filter => !activeFilters.has(filter.id)).length === 0 && (
              <span className="text-gray-500 italic text-sm">Todos los filtros están activos</span>
            )}
          </div>
        </div>

        {/* Filtros activos */}
        {Array.from(activeFilters).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {Array.from(activeFilters).map(filterId => {
              const filter = availableFilters.find(f => f.id === filterId);
              if (!filter) return null;
              
              const isDefault = defaultFilters.has(filterId);
              
              return (
                <div
                  key={filterId}
                  className={`flex items-start gap-2 p-3 rounded-lg border ${
                    isDefault 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {filter.label}
                      {isDefault && (
                        <span className="text-xs text-gray-500 ml-1">(requerido)</span>
                      )}
                    </label>
                    {filter.type === "search" ? (
                      <input
                        type="text"
                        value={filterValues[filterId] || ""}
                        onChange={(e) => handleFilterValueChange(filterId, e.target.value)}
                        placeholder="Buscar..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    ) : (
                      <select
                        value={filterValues[filterId] || ""}
                        onChange={(e) => handleFilterValueChange(filterId, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
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
                      className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition text-sm font-bold flex items-center justify-center"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg min-w-[300px] max-w-[500px]">
              <h4 className="text-lg font-semibold text-primary-600 mb-4">
                Guardar Vista Personalizada
              </h4>
              <input
                type="text"
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
                placeholder="Nombre de la vista (ej: Categorías recientes)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveFilter();
                  }
                }}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveFilterName("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveFilter}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros guardados */}
        {savedFilters.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Vistas Personalizadas:
            </h4>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map(savedFilter => (
                <div
                  key={savedFilter.id}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm"
                >
                  <span>{savedFilter.name}</span>
                  <button
                    onClick={() => handleLoadSavedFilter(savedFilter)}
                    className="px-2 py-0.5 bg-primary-600 text-white rounded text-xs hover:bg-primary-700 transition"
                    title="Cargar vista"
                  >
                    Cargar
                  </button>
                  <button
                    onClick={() => handleDeleteSavedFilter(savedFilter.id)}
                    className="text-red-600 hover:text-red-800 font-bold text-sm"
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

      {/* Grid de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.length > 0 ? (
          categorias.map((categoria) => (
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
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              No se encontraron categorías con los filtros seleccionados.
            </p>
          </div>
        )}
      </div>
      
      {categorias.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          <p>Total de categorías: <strong>{categorias.length}</strong></p>
        </div>
      )}
    </div>
  );
};

export default Categorias;
