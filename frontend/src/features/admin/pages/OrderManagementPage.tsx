import { useState, useEffect } from 'react';
import { orderService } from '@/features/orders/services/orderService';
import type { Order, OrderStatus } from '@/features/orders/types/order.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import Spinner from '@/components/common/Spinner';
import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import { formatDate, formatCurrency } from '@/utils/formatters';
import './OrderManagementPage.css';

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const OrderManagementPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getAll();
            setOrders(data);
        } catch {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingId(orderId);
        try {
            await orderService.updateStatus(orderId, newStatus);
            fetchOrders();
        } catch {
            alert('Failed to update order status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = filterStatus === 'ALL'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    if (loading) {
        return <Spinner fullScreen />;
    }

    return (
        <div className="order-management-page">
            <div className="page-header">
                <h1>Order Management</h1>
                <div className="filter-group">
                    <label>Filter by status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'ALL')}
                        className="status-filter"
                    >
                        <option value="ALL">All Orders</option>
                        {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Orders ({filteredOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Update Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="order-id">{order.id.slice(0, 8)}...</td>
                                    <td>{order.username}</td>
                                    <td>{formatDate(order.orderDate)}</td>
                                    <td>{order.items.length}</td>
                                    <td>{formatCurrency(order.totalAmount)}</td>
                                    <td><OrderStatusBadge status={order.status} /></td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                            disabled={updatingId === order.id || order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                                            className="status-select"
                                        >
                                            {ORDER_STATUSES.map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && (
                        <p className="no-orders">No orders found</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderManagementPage;
