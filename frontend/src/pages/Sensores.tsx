import React from "react";
import SensorList from "../components/SensorList";


const Sensores: React.FC = () => {
  return (
    <div>
      <div className="w-full bg-primary-600 text-white text-center py-2 text-lg font-semibold">
        Encuentra los mejores productos solo aqui
      </div>
      
      <div>
        <h1 className="text-4xl font-bold mb-8">Catálogo de Sensores</h1>
        <p className="text-gray-600 mb-6">
          Explora nuestro amplio catálogo de sensores agrícolas de última
          generación.
        </p>
        <SensorList />
      </div>
    </div>

    
  );
};

export default Sensores;
