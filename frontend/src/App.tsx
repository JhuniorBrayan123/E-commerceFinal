import React from "react";
import "./App.css";
import SensorList from "./components/SensorList";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🌱 Ecommerce de Sensores Agrícolas</h1>
        <p>Tu tienda especializada en tecnología agrícola</p>
      </header>
      <main>
        <SensorList />
      </main>
    </div>
  );
}

export default App;
