import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">E-Commerce</h3>
            <p className="text-gray-400">
              Tu tienda online de confianza. Encuentra los mejores productos al mejor precio.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/categorias" className="hover:text-white transition">Categorías</a></li>
              <li><a href="/productos" className="hover:text-white transition">Productos</a></li>
              <li><a href="/carrito" className="hover:text-white transition">Carrito</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <p className="text-gray-400">
              Email: contacto@ecommerce.com<br />
              Teléfono: +1 234 567 890
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 E-Commerce. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

