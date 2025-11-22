import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ------------------------------------------------------------
// DJANGO SERVICES (TU CÓDIGO ORIGINAL - NO SE TOCA)
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
    Object.keys(data).forEach((key) => {
      if (key === "imagen" && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post("/productos/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id: number, data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "imagen" && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
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

// Carrito localStorage (tu código original)
export const carritoService = {
  get: (): any[] => {
    const carrito = localStorage.getItem("carrito");
    return carrito ? JSON.parse(carrito) : [];
  },
  add: (producto: any, cantidad: number = 1) => {
    const carrito = carritoService.get();
    const existente = carrito.find((item: any) => item.id === producto.id);

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      carrito.push({ ...producto, cantidad });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    return carrito;
  },
  remove: (productoId: number) => {
    const carrito = carritoService
      .get()
      .filter((item: any) => item.id !== productoId);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    return carrito;
  },
  update: (productoId: number, cantidad: number) => {
    const carrito = carritoService.get();
    const item = carrito.find((item: any) => item.id === productoId);

    if (item) {
      if (cantidad <= 0) {
        return carritoService.remove(productoId);
      }
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
    return carrito.reduce((total: number, item: any) => {
      return total + parseFloat(item.precio) * item.cantidad;
    }, 0);
  },
};

export default api;

// ------------------------------------------------------------
// SPRING BOOT SERVICES (NUEVO - SE AGREGA SIN MODIFICAR NADA)
// ------------------------------------------------------------

// Base URL para microservicio de pagos
const PAYMENT_API_BASE_URL = "http://localhost:8080/api";

// Carrito manejado por Spring Boot
export const cartService = {
  addToCart: async (productId: number, quantity: number) => {
    const response = await fetch(`${PAYMENT_API_BASE_URL}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    return response.json();
  },

  getCart: async () => {
    const response = await fetch(`${PAYMENT_API_BASE_URL}/cart`);
    return response.json();
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    const response = await fetch(`${PAYMENT_API_BASE_URL}/cart/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    return response.json();
  },

  removeFromCart: async (itemId: string) => {
    const response = await fetch(`${PAYMENT_API_BASE_URL}/cart/remove`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    return response.json();
  },

  checkout: async (cartData: any) => {
    const response = await fetch(`${PAYMENT_API_BASE_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cartData),
    });
    return response.json();
  },
};

// Servicios de Pagos desde Spring Boot
export const paymentService = {
  processPayment: async (paymentData: any) => {
    const response = await fetch(`${PAYMENT_API_BASE_URL}/payment/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });
    return response.json();
  },

  getPaymentStatus: async (paymentId: string) => {
    const response = await fetch(
      `${PAYMENT_API_BASE_URL}/payment/status/${paymentId}`
    );
    return response.json();
  },
};
