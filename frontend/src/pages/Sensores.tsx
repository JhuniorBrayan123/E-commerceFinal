import React from "react";
import SensorList from "../components/SensorList";

const Sensores: React.FC = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Catálogo de Sensores</h1>
      <p className="text-gray-600 mb-6">
        Explora nuestro amplio catálogo de sensores agrícolas de última
        generación.
      </p>
      <SensorList />
    </div>
  );
};

export default Sensores;
