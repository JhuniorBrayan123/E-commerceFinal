import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersService } from '../services/api';

interface OrderItem {
    id: number;
    sensor: number;
    nombre: string;
    cantidad: number;
    precio_unitario: string;
    subtotal: string;
}

interface Order {
    id: number;
    total: string;
    estado: string;
    fecha_creacion: string;
    items: OrderItem[];
}

const MisPedidos: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // Obtener user_id del localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setError('Debes iniciar sesión para ver tus pedidos');
                setLoading(false);
                return;
            }

            const user = JSON.parse(userStr);
            const response = await ordersService.getMisPedidos(user.id);

            setOrders(response.data || []);
            setLoading(false);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError('Error al cargar los pedidos');
            setLoading(false);
        }
    };

    const getEstadoBadgeColor = (estado: string) => {
        const colors: { [key: string]: string } = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PROCESSING: 'bg-blue-100 text-blue-800',
            PAID: 'bg-green-100 text-green-800',
            COMPLETED: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
            // Fallback para minúsculas por si acaso
            pendiente: 'bg-yellow-100 text-yellow-800',
            procesando: 'bg-blue-100 text-blue-800',
            completada: 'bg-green-100 text-green-800',
            cancelada: 'bg-red-100 text-red-800',
        };
        return colors[estado] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Cargando pedidos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-xl mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
                    <p className="text-gray-600">Historial completo de tus compras</p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">No tienes pedidos aún</h3>
                        <p className="text-gray-500 mb-6">Comienza a explorar nuestro catálogo</p>
                        <button
                            onClick={() => navigate('/sensores')}
                            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition"
                        >
                            Ver Sensores
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* Header de la orden */}
                                <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Pedido #{order.id}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.fecha_creacion).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${getEstadoBadgeColor(order.estado)}`}>
                                            {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                                        </span>
                                        <p className="text-xl font-bold text-gray-900 mt-2">
                                            S/ {parseFloat(order.total).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Items del pedido */}
                                <div className="px-6 py-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Productos:</h4>
                                    <div className="space-y-2">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{item.nombre}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Cantidad: {item.cantidad} x S/ {parseFloat(item.precio_unitario).toFixed(2)}
                                                    </p>
                                                </div>
                                                <p className="font-semibold text-gray-900">
                                                    S/ {parseFloat(item.subtotal).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MisPedidos;
