import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Categorias from "./pages/Categorias";
import Productos from "./pages/Productos";
import ProductoDetalle from "./pages/ProductoDetalle";
import Sensores from "./pages/Sensores";
import Carrito from "./pages/Carrito";
import Inventario from "./pages/Inventario";
import CRUDProductos from "./pages/CRUDProductos";
import CRUDCategorias from "./pages/CRUDCategorias";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/categorias/:id" element={<Categorias />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<ProductoDetalle />} />
          <Route path="/sensores" element={<Sensores />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/admin/productos" element={<CRUDProductos />} />
          <Route path="/admin/categorias" element={<CRUDCategorias />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
