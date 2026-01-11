import { useOrders } from '../hooks/useOrders';
import OrderCard from '../components/OrderCard';
import Spinner from '@/components/common/Spinner';
import { ShoppingBag } from 'lucide-react';
import './OrdersPage.css';

const OrdersPage = () => {
    const { orders, loading, error, refetch } = useOrders();

    if (loading) {
        return <Spinner fullScreen />;
    }

    return (
        <div className="orders-page">
            <h1>My Orders</h1>

            {error && (
                <div className="orders-error">
                    <p>{error}</p>
                </div>
            )}

            {!error && orders.length === 0 && (
                <div className="orders-empty">
                    <ShoppingBag size={48} />
                    <h3>No orders yet</h3>
                    <p>Your order history will appear here</p>
                </div>
            )}

            <div className="orders-list">
                {orders.map((order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onOrderCancelled={refetch}
                    />
                ))}
            </div>
        </div>
    );
};

export default OrdersPage;
