import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import type { Order } from '../types/order.types';
import { Card, CardContent } from '@/components/common/Card';
import OrderStatusBadge from './OrderStatusBadge';
import Button from '@/components/common/Button';
import { orderService } from '../services/orderService';
import { formatDate, formatCurrency } from '@/utils/formatters';
import './OrderCard.css';

interface OrderCardProps {
    order: Order;
    onOrderCancelled?: () => void;
}

const OrderCard = ({ order, onOrderCancelled }: OrderCardProps) => {
    const navigate = useNavigate();
    const [isCancelling, setIsCancelling] = useState(false);

    const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

    const handleCancel = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        setIsCancelling(true);
        try {
            await orderService.cancel(order.id);
            onOrderCancelled?.();
        } catch {
            alert('Failed to cancel order. Please try again.');
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <Card
            className="order-card"
            hoverable
            onClick={() => navigate(`/orders/${order.id}`)}
        >
            <CardContent>
                <div className="order-card-header">
                    <div className="order-card-id">
                        <span className="label">Order #</span>
                        <span className="value">{order.id.slice(0, 8)}...</span>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>

                <div className="order-card-meta">
                    <div className="order-card-date">
                        <span className="label">Date</span>
                        <span className="value">{formatDate(order.orderDate)}</span>
                    </div>
                    <div className="order-card-items">
                        <span className="label">Items</span>
                        <span className="value">{order.items.length}</span>
                    </div>
                </div>

                <div className="order-card-footer">
                    <div className="order-card-total">
                        <span className="label">Total</span>
                        <span className="value">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    {canCancel && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            isLoading={isCancelling}
                            className="cancel-order-btn"
                        >
                            <X size={14} />
                            Cancel
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderCard;
