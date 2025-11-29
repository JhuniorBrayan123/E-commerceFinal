import axios from 'axios';

const PAYMENT_SERVICE_URL = 'http://localhost:8080/api';

interface OrderData {
    orderId: number;
    userId: number;
    total: number;
    currency: string;
    status: string;
    createdAt: string;
    items: {
        sensor_id: number;
        nombre: string;
        cantidad: number;
        precio_unitario: string;
        subtotal: string;
    }[];
}

// Función para obtener las órdenes del día actual
export const getTodayOrders = async (): Promise<OrderData[]> => {
    try {
        const token = localStorage.getItem('access_token');

        // Nota: Este endpoint probablemente no existe aún en el backend
        // Cuando esté disponible, usar algo como: /admin/orders/today
        const response = await axios.get(`${PAYMENT_SERVICE_URL}/admin/orders/today`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error obteniendo órdenes del día:', error);
        // Retornar array vacío si hay error
        return [];
    }
};

// Función para obtener estadísticas del admin
export const getAdminStats = async () => {
    try {
        const token = localStorage.getItem('access_token');

        const response = await axios.get(`${PAYMENT_SERVICE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return null;
    }
};

export const adminService = {
    getTodayOrders,
    getAdminStats,
};
