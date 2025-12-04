import React from "react";
import SensorList from "../components/SensorList";
import BannerCarousel from "../components/BannerCarousel";

const Sensores: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="w-full bg-primary-600 text-white text-center py-3 text-lg font-semibold mb-4">
        Encuentra los mejores sensores solo aquí
      </div>

      {/* Sticky Banner Carousel - Se mantiene visible durante el scroll */}
      <div className="top-0 z-40 bg-white shadow-md mb-6">
        <BannerCarousel />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">Catálogo de Sensores</h1>
        <p className="text-gray-600 mb-8">
          Explora nuestro amplio catálogo de sensores agrícolas de última
          generación.
        </p>

        <SensorList />
      </div>
    </div>
  );
};

export default Sensores;
