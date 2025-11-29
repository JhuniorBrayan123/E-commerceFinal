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
}


const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
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
      <div className="container mx-auto px-4">


        <div className="flex items-center justify-between h-36">

          <Link to="/" className="flex items-center space-x-2">
<<<<<<< HEAD
            <img src="/agrocodeLogo.svg" alt="logo" className="w-32 h-32" />
=======
            <img src="/logoWeb.svg" alt="logo" style={{ width: '450px', height: '450px' }} />
>>>>>>> origin/Jhunior
          </Link>

          {/* ENLACES CENTRALES — AHORA MAS COMPACTOS */}

          <div className="flex items-center space-x-2">



            <div className="relative group">
              <button className="px-3 py-2 rounded-full text-xl font-medium hover:bg-secondary-700 hover:text-white transition flex items-center">
                Categorias
                <svg
                  className="w-5 h-5 ml-1 transition-transform group-hover:rotate-180"
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
                  absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200
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
              className="px-3 py-2 rounded-full text-xl font-medium hover:bg-secondary-700 hover:text-white transition"
            >
              Soporte
            </Link>

            <Link
              to="/sensores"
              className="px-3 py-2 rounded-full text-xl font-medium hover:bg-secondary-700 hover:text-white transition"
            >
              Sensores
            </Link>

            <Link
              to="/inventario"
              className="px-3 py-2 rounded-full text-xl font-medium hover:bg-secondary-700 hover:text-white transition"
            >
              Inventario
            </Link>
          </div>

          {/* CARRITO + USUARIO */}
          <div className="flex items-center space-x-2">

            {/* Carrito */}
            <button
              onClick={() => navigate("/carrito")}
              className="relative px-3 py-2 rounded-full text-xl font-medium hover:bg-secondary-700 hover:text-white transition"
            >
              <svg
                className="w-6 h-6"
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
                <span className="absolute top-0 right-0 bg-secondary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Usuario */}
            {user && (

              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">
                  {user.first_name} {user.last_name}
                </span>
                <button
                  onClick={onLogout}
                  className="bg-primary-600 px-3 py-2 rounded-full text-ml font-medium  hover:bg-secondary-700 transition text-white"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
