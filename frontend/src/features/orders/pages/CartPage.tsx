import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import Button from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { formatCurrency } from '@/utils/formatters';
import './CartPage.css';

const CartPage = () => {
    const navigate = useNavigate();
    const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        if (items.length === 0) return;

        setIsCheckingOut(true);
        try {
            const orderRequest = {
                items: items.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                })),
            };

            const order = await orderService.create(orderRequest);
            clearCart();
            navigate(`/orders/${order.id}`);
        } catch {
            alert('Failed to create order. Please try again.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="cart-page">
                <h1>Shopping Cart</h1>
                <div className="cart-empty">
                    <ShoppingCart size={48} />
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started</p>
                    <Button onClick={() => navigate('/products')}>
                        Browse Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1>Shopping Cart</h1>

            <div className="cart-content">
                <div className="cart-items">
                    {items.map((item) => (
                        <Card key={item.product.id} className="cart-item">
                            <CardContent>
                                <div className="cart-item-row">
                                    <div className="cart-item-image">
                                        <Package size={32} />
                                    </div>

                                    <div className="cart-item-info">
                                        <h3>{item.product.name}</h3>
                                        <p className="cart-item-price">
                                            {formatCurrency(item.product.price)}
                                        </p>
                                    </div>

                                    <div className="cart-item-quantity">
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.product.stockQuantity}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <div className="cart-item-subtotal">
                                        {formatCurrency(item.product.price * item.quantity)}
                                    </div>

                                    <button
                                        className="remove-btn"
                                        onClick={() => removeItem(item.product.id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="cart-summary">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-total">
                            <span>Total</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            className="checkout-btn"
                            onClick={handleCheckout}
                            isLoading={isCheckingOut}
                        >
                            Place Order
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CartPage;
