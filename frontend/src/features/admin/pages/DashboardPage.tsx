import { Package, ShoppingBag, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import Spinner from '@/components/common/Spinner';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatShortDate } from '@/utils/formatters';
import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import './DashboardPage.css';

const DashboardPage = () => {
    const { stats, lowStockProducts, recentOrders, loading, error } = useDashboard();
    const navigate = useNavigate();

    if (loading) {
        return <Spinner fullScreen />;
    }

    if (error) {
        return <div className="dashboard-error">{error}</div>;
    }

    return (
        <div className="dashboard-page">
            <h1>Dashboard</h1>

            <div className="stats-grid">
                <Card className="stat-card">
                    <CardContent>
                        <div className="stat-icon">
                            <Package size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalProducts}</span>
                            <span className="stat-label">Total Products</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="stat-card warning" onClick={() => navigate('/admin/low-stock')}>
                    <CardContent>
                        <div className="stat-icon">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.lowStockProducts}</span>
                            <span className="stat-label">Low Stock Items</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="stat-card">
                    <CardContent>
                        <div className="stat-icon">
                            <ShoppingBag size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalOrders}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="stat-card">
                    <CardContent>
                        <div className="stat-icon">
                            <Clock size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.pendingOrders}</span>
                            <span className="stat-label">Pending Orders</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="stat-card">
                    <CardContent>
                        <div className="stat-icon">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.processingOrders}</span>
                            <span className="stat-label">Processing</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="stat-card success">
                    <CardContent>
                        <div className="stat-icon">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.deliveredOrders}</span>
                            <span className="stat-label">Delivered</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="dashboard-content">
                <Card className="recent-orders">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <p className="no-data">No orders yet</p>
                        ) : (
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} onClick={() => navigate(`/admin/orders`)}>
                                            <td className="order-id">{order.id.slice(0, 8)}...</td>
                                            <td>{order.username}</td>
                                            <td>{formatShortDate(order.orderDate)}</td>
                                            <td>{formatCurrency(order.totalAmount)}</td>
                                            <td><OrderStatusBadge status={order.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                <Card className="low-stock-alert">
                    <CardHeader>
                        <CardTitle>Low Stock Alert</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStockProducts.length === 0 ? (
                            <p className="no-data">All products are well stocked</p>
                        ) : (
                            <ul className="low-stock-list">
                                {lowStockProducts.slice(0, 5).map((product) => (
                                    <li key={product.id}>
                                        <span className="product-name">{product.name}</span>
                                        <span className="stock-count">{product.stockQuantity} left</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
