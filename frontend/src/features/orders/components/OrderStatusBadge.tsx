import Badge from '@/components/common/Badge';
import type { OrderStatus } from '../types/order.types';

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive'; label: string }> = {
    PENDING: { variant: 'secondary', label: 'Pending' },
    CONFIRMED: { variant: 'default', label: 'Confirmed' },
    PROCESSING: { variant: 'warning', label: 'Processing' },
    SHIPPED: { variant: 'default', label: 'Shipped' },
    DELIVERED: { variant: 'success', label: 'Delivered' },
    CANCELLED: { variant: 'destructive', label: 'Cancelled' },
};

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
    const config = statusConfig[status];

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
};

export default OrderStatusBadge;
