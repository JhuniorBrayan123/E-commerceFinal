import axios from "axios";
import { SERVICES } from "../config/services";

// Cliente Axios para CatalogService (Django)
const api = axios.create({
  baseURL: SERVICES.CATALOG,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado, limpiar localStorage y redirigir al login
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

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


// sensores productos 
// export const sensoresService = {
//   getAll: () => api.get("/sensores/"),
//   getById: (id: number) => api.get(`/sensores/${id}/`),
//   create: (data: any) => api.post("/sensores/", data),
//   update: (id : number, data: any) => api.put(`/sensores/${id}/`, data),
//   delete: (id: number)  => api.delete(`/sensores/${id}/`), 
// }

// Comentarios 
export const comentariosService = {
  getAll: (id: number) => api.get(`/comentarios/?producto_id=${id}`),
  getById: (id: number) => api.get(`/comentarios/${id}/`),
  create: (data: any) => api.post("/comentarios/", data),
  update: (id: number, data: any) => api.put(`/comentarios/${id}/`, data),
  delete: (id: number) => api.delete(`/comentarios/${id}/`),
}

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
export const bannersService = {
  getAll: () => api.get("/banners/"),
  getById: (id: number) => api.get(`/banners/${id}/`),
};

export const carritoService = {
  get: (): any[] => JSON.parse(localStorage.getItem("carrito") || "[]"),
  add: (producto: any, cantidad: number = 1, stock: number) => {
    const carrito = carritoService.get();
    const existente = carrito.find((item) => item.id === producto.id);

    if (existente) existente.cantidad += cantidad;
    else carrito.push({ ...producto, cantidad, stock });

    localStorage.setItem("carrito", JSON.stringify(carrito));
    return carrito;
  },
  remove: (productoId: number) => {
    const carrito = carritoService.get().filter((i) => i.id !== productoId);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    return carrito;
  },
  update: (productoId: number, cantidad: number, stock: number) => {
    const carrito = carritoService.get();
    const item = carrito.find((i) => i.id === productoId);

    if (item) {
      if (cantidad <= 0) return carritoService.remove(productoId);
      item.cantidad = cantidad;
      item.stock = stock;
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
  addToCart: async (productId: number, quantity: number, stock: number) => {
    const res = await fetch(`${PAYMENT_API}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity, stock }),
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

// Sensores apis 
export const sensoresService = {
  getAll: (params?: any) => api.get("/sensores/", { params }),
  getById: (id: number) => api.get(`/sensores/${id}/`),
  getFilters: () => api.get("/filters/"),
  getStats: () => api.get("/stats/"),
  create: (data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    return api.post("/sensores/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id: number, data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    return api.put(`/sensores/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id: number) => api.delete(`/sensores/${id}/`),
};


// Helper para agregar JWT a fetch requests
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Payment Service - Orden
export const orderService = {
  createOrder: async (orderData: any) => {
    try {
      const url = `${PAYMENT_API}/payment/order`;
      const headers = getAuthHeaders();

      console.log('orderService.createOrder - Enviando petición a:', url);
      console.log('orderService.createOrder - Headers:', headers);
      console.log('orderService.createOrder - Body:', JSON.stringify(orderData, null, 2));

      const res = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(orderData),
      });

      console.log('orderService.createOrder - Status:', res.status);
      console.log('orderService.createOrder - Status Text:', res.statusText);

      const text = await res.text();
      console.log('orderService.createOrder - Response text:', text);

      let data;
      try {
        data = text ? JSON.parse(text) : {};
        console.log('orderService.createOrder - Parsed data:', data);
      } catch (parseError) {
        console.error('orderService.createOrder - Error parsing JSON:', parseError);
        throw new Error(`Error al parsear la respuesta del servidor: ${text.substring(0, 200)}`);
      }

      if (!res.ok) {
        // Si hay un error, lanzar excepción con el mensaje
        const errorMessage = data.message || data.error?.message || data.error || `Error ${res.status}: ${res.statusText}`;
        console.error('orderService.createOrder - Error response:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('orderService.createOrder - Success, returning data');
      return data;
    } catch (error: any) {
      console.error('orderService.createOrder - Exception caught:', error);

      // Manejar errores de red específicos
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw new Error("No se pudo conectar con el servicio de pagos. Verifica que el servicio esté corriendo en el puerto 8085.");
      }

      // Si ya es un Error, re-lanzarlo
      if (error instanceof Error) {
        throw error;
      }

      // Si no, crear un nuevo Error
      throw new Error("Error de conexión al crear la orden: " + (error.message || String(error)));
    }
  },

  getOrderStatus: async (orderId: number) => {
    const res = await fetch(`${PAYMENT_API}/payment/status/${orderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al obtener el estado de la orden");
    }
    return res.json();
  },
};

// Payment Service - Confirmación
export const paymentService = {
  confirmPayment: async (confirmData: any) => {
    const res = await fetch(`${PAYMENT_API}/payment/confirm`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(confirmData),
    });

    const data = await res.json();

    if (!res.ok) {
      // Extraer mensaje de error más detallado
      const errorMessage = data.error?.message || data.message || data.error?.code || "Error al procesar el pago";
      const error = new Error(errorMessage);
      // Agregar información adicional al error
      (error as any).code = data.error?.code;
      (error as any).response = data;
      throw error;
    }

    // Si success es false, también lanzar error
    if (data.success === false) {
      const errorMessage = data.error?.message || data.message || "Error al procesar el pago";
      const error = new Error(errorMessage);
      (error as any).code = data.error?.code;
      (error as any).response = data;
      throw error;
    }

    return data;
  },

  processPayment: async (paymentData: any) => {
    const res = await fetch(`${PAYMENT_API}/payment/process`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al procesar el pago");
    }
    return res.json();
  },

  getPaymentStatus: async (paymentId: string) => {
    const res = await fetch(`${PAYMENT_API}/payment/status/${paymentId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al obtener el estado del pago");
    }
    return res.json();
  },
};
