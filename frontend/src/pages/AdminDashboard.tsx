import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { adminService } from '../services/adminService';

interface OrderItem {
    id: number;
    customerName: string;
    total: number;
    items: number;
    status: string;
    timestamp: string;
    trackingStatus: 'preparing' | 'shipped' | 'inTransit' | 'delivered';
    location: string;
}

const AdminDashboard: React.FC = () => {
    const [salesToday, setSalesToday] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(8);
    const [totalCustomers, setTotalCustomers] = useState(214);
    const [monthlyRevenue, setMonthlyRevenue] = useState(38500.00);
    const [totalOrders, setTotalOrders] = useState(0);
    const [todayOrders, setTodayOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar órdenes del día al montar el componente
    useEffect(() => {
        const loadTodayOrders = async () => {
            try {
                setLoading(true);
                const orders = await adminService.getTodayOrders();

                // Transformar las órdenes del backend al formato del componente
                const transformedOrders: OrderItem[] = orders.map((order: any, index: number) => {
                    const orderDate = new Date(order.createdAt);
                    const hours = orderDate.getHours().toString().padStart(2, '0');
                    const minutes = orderDate.getMinutes().toString().padStart(2, '0');

                    return {
                        id: order.orderId,
                        customerName: `Usuario #${order.userId}`, // Por ahora, hasta tener endpoint de usuarios
                        total: order.total,
                        items: order.items?.length || 0,
                        status: order.status === 'PAID' ? 'Pagado' : 'Pendiente',
                        timestamp: `${hours}:${minutes}`,
                        trackingStatus: order.status === 'PAID' ? 'shipped' : 'preparing',
                        location: order.status === 'PAID' ? 'Lima, Perú - En preparación' : 'Almacén - Verificando pago'
                    };
                });

                setTodayOrders(transformedOrders);

                // Calcular estadísticas basadas en las órdenes
                const totalSales = transformedOrders.reduce((sum, order) =>
                    order.status === 'Pagado' ? sum + order.total : sum, 0
                );
                setSalesToday(totalSales);

                const pending = transformedOrders.filter(order => order.status === 'Pendiente').length;
                setPendingOrders(pending);

                setTotalOrders(transformedOrders.length);

            } catch (error) {
                console.error('Error cargando órdenes:', error);
                // Si hay error, mostrar mensaje vacío
                setTodayOrders([]);
            } finally {
                setLoading(false);
            }
        };

        loadTodayOrders();
    }, []);

    const getTrackingStatusText = (status: string) => {
        switch (status) {
            case 'preparing':
                return 'Preparando';
            case 'shipped':
                return 'Enviado';
            case 'inTransit':
                return 'En tránsito';
            case 'delivered':
                return 'Entregado';
            default:
                return 'Desconocido';
        }
    };

    const getTrackingStatusColor = (status: string) => {
        switch (status) {
            case 'preparing':
                return '#ff9800';
            case 'shipped':
                return '#2196f3';
            case 'inTransit':
                return '#9c27b0';
            case 'delivered':
                return '#4caf50';
            default:
                return '#757575';
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Tarjeta de bienvenida */}
            <div className="welcome-card">
                <h1>Bienvenido admin </h1>
                <p>Gestiona usuarios, productos, inventario, compras y ventas desde un solo lugar.</p>
            </div>

            {/* Estadísticas principales */}
            <div className="stats-grid">
                <div className="stat-card sales">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>Ventas hoy</h3>
                        <p className="stat-value">S/ {salesToday.toFixed(2)}</p>
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <h3>Pendientes</h3>
                        <p className="stat-value">{pendingOrders}</p>
                    </div>
                </div>

                <div className="stat-card stock">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <h3>Stock bajo</h3>
                        <p className="stat-value">{lowStockCount}</p>
                    </div>
                </div>

                <div className="stat-card customers">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>Clientes</h3>
                        <p className="stat-value">{totalCustomers}</p>
                    </div>
                </div>
            </div>

            {/* Sección de ingresos y pedidos */}
            <div className="revenue-stats">
                <div className="revenue-card">
                    <div className="revenue-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="2" width="20" height="20" rx="2" />
                            <path d="M12 6v12M15 9l-3-3-3 3" />
                        </svg>
                    </div>
                    <div className="revenue-content">
                        <h3>Ingresos (30d)</h3>
                        <p className="revenue-value">S/ {monthlyRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                        <span className="revenue-change positive">↗ +8.2% vs. mes anterior</span>
                    </div>
                </div>

                <div className="orders-card">
                    <div className="orders-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6l-3-4H6zM3 6h18M16 10a4 4 0 11-8 0" />
                        </svg>
                    </div>
                    <div className="orders-content">
                        <h3>Pedidos</h3>
                        <p className="orders-value">{totalOrders}</p>
                        <span className="orders-change positive">↗ +3.1% esta semana</span>
                    </div>
                </div>
            </div>

            {/* Tabla de pedidos del día */}
            <div className="orders-section">
                <h2>Pedidos de Hoy</h2>
                <div className="orders-table-container">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                            Cargando pedidos del día...
                        </div>
                    ) : todayOrders.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                            <p style={{ fontSize: '1.1em', marginBottom: '8px' }}>No hay pedidos registrados hoy</p>
                            <p style={{ fontSize: '0.9em', color: '#999' }}>
                                Los pedidos que se realicen hoy aparecerán aquí automáticamente
                            </p>
                        </div>
                    ) : (
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Items</th>
                                    <th>Hora</th>
                                    <th>Estado de Pago</th>
                                    <th>Rastreo</th>
                                    <th>Ubicación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todayOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td className="customer-name">{order.customerName}</td>
                                        <td className="order-total">S/ {order.total.toFixed(2)}</td>
                                        <td>{order.items}</td>
                                        <td>{order.timestamp}</td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className="tracking-status"
                                                style={{ backgroundColor: getTrackingStatusColor(order.trackingStatus) }}
                                            >
                                                {getTrackingStatusText(order.trackingStatus)}
                                            </span>
                                        </td>
                                        <td className="location-cell">
                                            <div className="location-info">
                                                <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                </svg>
                                                {order.location}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
