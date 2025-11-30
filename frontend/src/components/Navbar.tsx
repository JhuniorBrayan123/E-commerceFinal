import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { carritoService } from "../services/api";
import { categoriasService } from "../services/api";

interface NavbarProps {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  onLogout: () => void;
  onOpenLogin?: () => void;
}


const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenLogin }) => {
  const navigate = useNavigate();
  const carrito = carritoService.get();
  const totalItems = carrito.reduce(
    (sum: number, item: any) => sum + item.cantidad,
    0
  );

  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaActual, setCategoriaActual] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allCategorias, setAllCategorias] = useState<any[]>([]);
  const [allSensores, setAllSensores] = useState<any[]>([]);

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

  const HandleSensoresPorCategoria = async (categoriaId: number) => {
    try {
      // Obtiene los sensores de la categoría seleccionada
      const res = await categoriasService.getProductos(categoriaId);
      setAllSensores(res.data);
      //Los manda como paquete 
      navigate("/sensores", { state: { sensoresFiltradoCategoria: res.data } });

    } catch (err) {
      console.error(err);
    }
  }


  return (
    <nav className="bg-primary-700 text-black shadow-lg">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-20 sm:h-28 md:h-36">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img 
              src="/logoWeb.svg" 
              alt="logo" 
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-[450px] lg:h-[450px] object-contain"
            />
          </Link>

          {/* ENLACES CENTRALES — AHORA MAS COMPACTOS */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">



            <div className="relative group">
              <button className="px-2 sm:px-3 py-1 sm:py-2 rounded-full text-sm sm:text-base md:text-xl font-medium hover:bg-secondary-700 hover:text-white transition flex items-center">
                <span className="hidden sm:inline">Categorias</span>
                <span className="sm:hidden">Cat</span>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 ml-1 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* MENU DESPLEGABLE */}
              <div
                className="
                  absolute left-0 mt-2 w-40 sm:w-48 bg-white rounded-xl shadow-lg border border-gray-200
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200
                  z-50
                "
              >
                {allCategorias.map((categoria) => (
                  <button
                    key={categoria.id}
                    onClick={() => navigate("/sensores/" + categoria.nombre + "/" + categoria.id)}
                    className="block px-4 py-2 text-black hover:bg-secondary-700 hover:text-white rounded-xl"
                  >
                    {categoria.nombre}
                  </button>
                ))}

              </div>
            </div>


            <Link
              to="/soporte"
              className="px-2 sm:px-3 py-1 sm:py-2 rounded-full text-sm sm:text-base md:text-xl font-medium hover:bg-secondary-700 hover:text-white transition"
            >
              <span className="hidden sm:inline">Soporte</span>
              <span className="sm:hidden">Sop</span>
            </Link>

            <Link
              to="/sensores"
              className="px-2 sm:px-3 py-1 sm:py-2 rounded-full text-sm sm:text-base md:text-xl font-medium hover:bg-secondary-700 hover:text-white transition"
            >
              <span className="hidden sm:inline">Sensores</span>
              <span className="sm:hidden">Sen</span>
            </Link>
          </div>

          {/* CARRITO + USUARIO */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">

            {/* Carrito */}
            <button
              onClick={() => navigate("/carrito")}
              className="btn-animated relative px-2 sm:px-3 py-1 sm:py-2 rounded-full text-sm sm:text-base md:text-xl font-medium hover:bg-secondary-700 hover:text-white"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Usuario */}
            {user ? (
              <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                <span className="font-semibold text-xs sm:text-sm hidden sm:inline">
                  {user.first_name} {user.last_name}
                </span>
                <button
                  onClick={onLogout}
                  className="btn-animated bg-primary-600 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-medium hover:bg-secondary-700 text-white whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Cerrar sesión</span>
                  <span className="sm:hidden">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin || (() => navigate("/auth"))}
                className="btn-animated bg-secondary-600 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-medium hover:bg-secondary-700 text-white whitespace-nowrap"
              >
                <span className="hidden sm:inline">Iniciar Sesión</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
