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
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span className="text-xl font-bold">E-Commerce</span>
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
