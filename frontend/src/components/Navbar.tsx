import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { carritoService } from "../services/api";
import { categoriasService } from "../services/api";
import AdminLoginModal from "./AdminLoginModal";

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

  const [allCategorias, setAllCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        const res = await categoriasService.getAll();
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

  return (
    <nav className="bg-primary-700 text-black shadow-lg relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 sm:h-24">

          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img
              src="/logoWeb.svg"
              alt="logo"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-[450px] lg:h-[450px] object-contain"
            />
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative group">
              <button className="px-3 py-2 rounded-full text-xl font-medium hover:bg-secondary-700 hover:text-white transition flex items-center">
                <span>Categorias</span>
                <svg className="w-5 h-5 ml-1 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {allCategorias.map((categoria) => (
                  <button
                    key={categoria.id}
                    onClick={() => navigate("/sensores/" + categoria.nombre + "/" + categoria.id)}
                    className="block w-full text-left px-4 py-2 text-black hover:bg-secondary-700 hover:text-white first:rounded-t-xl last:rounded-b-xl"
                  >
                    {categoria.nombre}
                  </button>
                ))}
              </div>
            </div>

            <Link to="/soporte" className="px-3 py-2 rounded-full text-xl font-medium hover:bg-secondary-700 hover:text-white transition">
              Soporte
            </Link>

            <Link to="/sensores" className="px-3 py-2 rounded-full text-xl font-medium hover:bg-secondary-700 hover:text-white transition">
              Sensores
            </Link>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center space-x-4">

            {/* CARRITO */}
            <button
              onClick={() => navigate("/carrito")}
              className="btn-animated relative p-2 rounded-full hover:bg-secondary-700 hover:text-white transition"
              aria-label="Carrito de compras"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            {/* DESKTOP USER ACTIONS */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <span className="font-semibold text-sm">
                    {user.first_name} {user.last_name}
                  </span>

                  <button
                    onClick={onLogout}
                    className="btn-animated bg-primary-600 px-4 py-2 rounded-full text-base font-medium hover:bg-secondary-700 text-white"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="relative group">
                  <button
                    className="btn-animated bg-secondary-600 px-4 py-2 rounded-full text-base font-medium hover:bg-secondary-700 text-white flex items-center gap-2"
                  >
                    <span>Iniciar Sesión</span>
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                    <button
                      onClick={onOpenLogin || (() => navigate("/auth"))}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-secondary-50 hover:text-secondary-700 transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Cliente
                    </button>
                    <button
                      onClick={() => setIsAdminModalOpen(true)}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-secondary-50 hover:text-secondary-700 transition flex items-center gap-2 border-t border-gray-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Administrador
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* HAMBURGER BUTTON */}
            <button
              className="md:hidden p-2 rounded-md text-black hover:bg-secondary-700 hover:text-white focus:outline-none transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menú principal"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 flex flex-col animate-fade-in-down">
            <div className="px-4 py-2 space-y-1">

              <div>
                <button
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                  className="w-full flex justify-between items-center px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <span>Categorías</span>
                  <svg className={`w-5 h-5 transition-transform ${isMobileCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isMobileCategoriesOpen && (
                  <div className="pl-4 space-y-1 bg-gray-50 rounded-lg mb-2">
                    {allCategorias.map((categoria) => (
                      <button
                        key={categoria.id}
                        onClick={() => {
                          navigate("/sensores/" + categoria.nombre + "/" + categoria.id);
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-600 hover:text-secondary-700"
                      >
                        {categoria.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/soporte"
                className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Soporte
              </Link>

              <Link
                to="/sensores"
                className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Sensores
              </Link>

              <div className="border-t border-gray-100 my-2 pt-2">
                {user ? (
                  <div className="px-4 py-2">
                    <p className="text-sm text-gray-500 mb-2">Hola, {user.first_name}</p>

                    <button
                      onClick={() => {
                        onLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full btn-animated bg-primary-600 py-2 rounded-lg text-white font-medium hover:bg-secondary-700"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-2">
                    <button
                      onClick={() => {
                        if (onOpenLogin) onOpenLogin();
                        else navigate("/auth");
                        setIsMenuOpen(false);
                      }}
                      className="w-full btn-animated bg-secondary-600 py-2 rounded-lg text-white font-medium hover:bg-secondary-700"
                    >
                      Iniciar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Admin Login */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
