import { useNavigate } from 'react-router-dom';
import type { Order } from '../types/order.types';
import { Card, CardContent } from '@/components/common/Card';
import OrderStatusBadge from './OrderStatusBadge';
import { formatDate, formatCurrency } from '@/utils/formatters';
import './OrderCard.css';

interface OrderCardProps {
    order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
    const navigate = useNavigate();

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

                <div className="order-card-total">
                    <span className="label">Total</span>
                    <span className="value">{formatCurrency(order.totalAmount)}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderCard;
