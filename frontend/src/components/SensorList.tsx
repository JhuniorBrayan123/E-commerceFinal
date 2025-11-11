import React, { useState, useEffect } from "react";
import "./SensorList.css";

interface Sensor {
  id: number;
  nombre: string;
  tipo: string;
  marca: string;
  modelo: string;
  precio: string; // ← CAMBIADO A string
  descripcion: string;
  stock: number;
  disponible: boolean;
}

const SensorList: React.FC = () => {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSensores = async () => {
      try {
        const response = await fetch("http://localhost:8001/sensores/");
        if (!response.ok) {
          throw new Error("Error al cargar sensores");
        }
        const data = await response.json();
        // Usar data.sensores específicamente
        setSensores(data.sensores);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchSensores();
  }, []);

  if (loading) return <div className="loading">Cargando sensores...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="sensor-list">
      <h2>Catálogo de Sensores</h2>
      <div className="sensors-grid">
        {sensores.map((sensor) => (
          <div key={sensor.id} className="sensor-card">
            <h3>{sensor.nombre}</h3>
            <p className="sensor-type">Tipo: {sensor.tipo}</p>
            <p className="sensor-brand">Marca: {sensor.marca}</p>
            <p className="sensor-price">Precio: ${sensor.precio}</p>
            <p className="sensor-stock">Stock: {sensor.stock} unidades</p>
            <p className="sensor-description">{sensor.descripcion}</p>
            <button
              className="add-to-cart-btn"
              disabled={!sensor.disponible || sensor.stock === 0}
            >
              {sensor.disponible && sensor.stock > 0
                ? "Agregar al carrito"
                : "No disponible"}
            </button>
          </div>
        ))}
      </div>
      {sensores.length === 0 && !loading && (
        <div className="no-sensors">
          <p>No hay sensores disponibles en este momento.</p>
          <p>💡 Agrega algunos sensores desde el admin de Django.</p>
        </div>
      )}
    </div>
  );
};

export default SensorList;
