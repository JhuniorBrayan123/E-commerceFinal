import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { carritoService } from "../services/api";


const Navbar: React.FC = () => {
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
          <Link to="/" className="flex items-center space-x-2">
            
            <img src="/agrocodeLogo.svg" alt="logo" className="w-32 h-32" />
            
          </Link>

          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
