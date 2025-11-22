import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { carritoService } from "../services/api";

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

  return (
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/agrocodeLogo.svg" alt="logo" className="w-32 h-32" />
          </Link>

          {/* ENLACES CENTRALES — AHORA MAS COMPACTOS */}
          <div className="flex items-center space-x-2">
            <Link
              to="/categorias"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition"
            >
              Categorías
            </Link>

            <Link
              to="/productos"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition"
            >
              Productos
            </Link>

            <Link
              to="/soporte"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition"
            >
              Soporte
            </Link>

            <Link
              to="/sensores"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition"
            >
              Sensores
            </Link>

            <Link
              to="/inventario"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition"
            >
              Inventario
            </Link>
          </div>

          {/* CARRITO + USUARIO */}
          <div className="flex items-center space-x-2">

            {/* Carrito */}
            <button
              onClick={() => navigate("/carrito")}
              className="relative px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition"
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
                  className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition"
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
