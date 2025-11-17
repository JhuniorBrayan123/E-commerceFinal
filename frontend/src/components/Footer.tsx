import React from 'react';
import { FiBox, FiShoppingCart, FiGrid } from 'react-icons/fi';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';


const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Agrocode</h3>
            <p className="text-gray-400">
              Tu tienda online de sensores de confianza. Encuentra los mejores de cada tipo solo aqui.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces - Redes sociales</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://www.tiktok.com/@jhunior_gutierrez" target="_blank" className="flex items-center space-x-2 hover:text-white transition"><SiTiktok size={24} /> <span>Tiktok</span></a></li>
              <li><a href="https://www.facebook.com/brayan.gutierrez.05?locale=es_LA" target="_blank" className="flex items-center space-x-2 hover:text-white transition"><FaFacebook size={24} /> <span>Facebook</span> </a></li>
              <li><a href="https://www.instagram.com/agrocode_bioscience/" target="_blank" className="flex items-center space-x-2 hover:text-white transition"><FaInstagram size={24} /> <span>Instagram</span></a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <p className="text-gray-400">
              Email: agrocode@gmail.com<br />
              Teléfono: +51 989 604 884
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Agrocode. Todos los derechos reservados a Agrocode.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

