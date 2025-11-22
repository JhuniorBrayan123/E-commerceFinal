import axios from "axios";
import { SERVICES } from "../config/services";

// Cliente Axios para CatalogService (Django)
const api = axios.create({
  baseURL: SERVICES.CATALOG,
  headers: {
    "Content-Type": "application/json",
  },
});

// ------------------------------------------------------------
// DJANGO SERVICES (TU CÓDIGO ORIGINAL)
// ------------------------------------------------------------

// Categorías
export const categoriasService = {
  getAll: () => api.get("/categorias/"),
  getById: (id: number) => api.get(`/categorias/${id}/`),
  create: (data: any) => api.post("/categorias/", data),
  update: (id: number, data: any) => api.put(`/categorias/${id}/`, data),
  delete: (id: number) => api.delete(`/categorias/${id}/`),
  getProductos: (id: number) => api.get(`/categorias/${id}/productos/`),
};

// Productos
export const productosService = {
  getAll: (params?: any) => api.get("/productos/", { params }),
  getById: (id: number) => api.get(`/productos/${id}/`),
  create: (data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    return api.post("/productos/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id: number, data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    return api.put(`/productos/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id: number) => api.delete(`/productos/${id}/`),
  porCategoria: (categoriaId: number) =>
    api.get(`/productos/por_categoria/?categoria_id=${categoriaId}`),
  buscar: (query: string) => api.get(`/productos/buscar/?q=${query}`),
  activos: () => api.get("/productos/activos/"),
};

// Inventario
export const inventarioService = {
  getAll: (params?: any) => api.get("/inventario/", { params }),
  getById: (id: number) => api.get(`/inventario/${id}/`),
  registrarMovimiento: (data: any) =>
    api.post("/inventario/registrar_movimiento/", data),
  historial: (productoId?: number) => {
    const params = productoId ? { producto_id: productoId } : {};
    return api.get("/inventario/historial/", { params });
  },
  stockActual: (productoId: number) =>
    api.get(`/inventario/stock_actual/?producto_id=${productoId}`),
};

// Carrito local
export const carritoService = {
  get: (): any[] => JSON.parse(localStorage.getItem("carrito") || "[]"),
  add: (producto: any, cantidad: number = 1) => {
    const carrito = carritoService.get();
    const existente = carrito.find((item) => item.id === producto.id);

    if (existente) existente.cantidad += cantidad;
    else carrito.push({ ...producto, cantidad });

    localStorage.setItem("carrito", JSON.stringify(carrito));
    return carrito;
  },
  remove: (productoId: number) => {
    const carrito = carritoService.get().filter((i) => i.id !== productoId);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    return carrito;
  },
  update: (productoId: number, cantidad: number) => {
    const carrito = carritoService.get();
    const item = carrito.find((i) => i.id === productoId);

    if (item) {
      if (cantidad <= 0) return carritoService.remove(productoId);
      item.cantidad = cantidad;
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    return carrito;
  },
  clear: () => {
    localStorage.removeItem("carrito");
    return [];
  },
  getTotal: () => {
    const carrito = carritoService.get();
    return carrito.reduce(
      (total, item) => total + parseFloat(item.precio) * item.cantidad,
      0
    );
  },
};

export default api;

// ------------------------------------------------------------
// SPRING BOOT SERVICES (Pago & Carrito Remoto)
// ------------------------------------------------------------

const PAYMENT_API = SERVICES.PAYMENT;

export const cartService = {
  addToCart: async (productId: number, quantity: number) => {
    const res = await fetch(`${PAYMENT_API}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    return res.json();
  },

  getCart: async () => {
    const res = await fetch(`${PAYMENT_API}/cart`);
    return res.json();
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    const res = await fetch(`${PAYMENT_API}/cart/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    return res.json();
  },

  removeFromCart: async (itemId: string) => {
    const res = await fetch(`${PAYMENT_API}/cart/remove`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    return res.json();
  },

  checkout: async (cartData: any) => {
    const res = await fetch(`${PAYMENT_API}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cartData),
    });
    return res.json();
  },
};

// Payment
export const paymentService = {
  processPayment: async (paymentData: any) => {
    const res = await fetch(`${PAYMENT_API}/payment/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });
    return res.json();
  },

  getPaymentStatus: async (paymentId: string) => {
    const res = await fetch(`${PAYMENT_API}/payment/status/${paymentId}`);
    return res.json();
  },
};
