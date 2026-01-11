import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { useOrder } from '../hooks/useOrders';
import { orderService } from '../services/orderService';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { useState } from 'react';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { order, loading, error, refetch } = useOrder(id || '');
    const [cancelling, setCancelling] = useState(false);

    if (loading) {
        return <Spinner fullScreen />;
    }

    if (error || !order) {
        return (
            <div className="order-detail-error">
                <h2>Order not found</h2>
                <Button onClick={() => navigate('/orders')}>
                    <ArrowLeft size={18} />
                    Back to Orders
                </Button>
            </div>
        );
    }

    const canCancel = order.status === 'PENDING';

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        setCancelling(true);
        try {
            await orderService.cancel(order.id);
            refetch();
        } catch {
            alert('Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="order-detail-page">
            <button className="back-button" onClick={() => navigate('/orders')}>
                <ArrowLeft size={18} />
                Back to Orders
            </button>

            <div className="order-detail-header">
                <div>
                    <h1>Order #{order.id.slice(0, 8)}...</h1>
                    <p className="order-date">Placed on {formatDate(order.orderDate)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            <div className="order-detail-content">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="order-items">
                            {order.items.map((item) => (
                                <div key={item.id} className="order-item">
                                    <div className="order-item-image">
                                        <Package size={24} />
                                    </div>
                                    <div className="order-item-info">
                                        <span className="order-item-name">{item.productName}</span>
                                        <span className="order-item-qty">Qty: {item.quantity}</span>
                                    </div>
                                    <div className="order-item-price">
                                        <span className="unit-price">{formatCurrency(item.unitPrice)} each</span>
                                        <span className="subtotal">{formatCurrency(item.subtotal)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-total">
                            <span>Total</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </CardContent>
                </Card>

                {canCancel && (
                    <div className="order-actions">
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            isLoading={cancelling}
                        >
                            Cancel Order
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPage;
