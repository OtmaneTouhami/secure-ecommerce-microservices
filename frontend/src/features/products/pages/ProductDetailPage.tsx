import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '@/features/orders/context/CartContext';
import { useAuth } from '@/features/auth';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { product, loading, error } = useProduct(id || '');
    const { addItem, getAvailableStock, getItemQuantity, canAddToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [quantity, setQuantity] = useState(1);

    // Get reactive stock values
    const availableStock = product ? getAvailableStock(product) : 0;
    const inCart = product ? getItemQuantity(product.id) : 0;
    const canAdd = product ? canAddToCart(product) : false;

    // Reset quantity when available stock changes
    useEffect(() => {
        if (quantity > availableStock && availableStock > 0) {
            setQuantity(availableStock);
        } else if (availableStock === 0) {
            setQuantity(1);
        }
    }, [availableStock, quantity]);

    if (loading) {
        return <Spinner fullScreen />;
    }

    if (error || !product) {
        return (
            <div className="product-detail-error">
                <h2>Product not found</h2>
                <Button onClick={() => navigate('/products')}>
                    <ArrowLeft size={18} />
                    Back to Products
                </Button>
            </div>
        );
    }

    const isLowStock = product.stockQuantity <= 10 && product.stockQuantity > 0;
    const isOutOfStock = product.stockQuantity === 0;

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= availableStock) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if (canAdd && quantity > 0) {
            addItem(product, quantity);
            setQuantity(Math.min(1, availableStock - quantity));
        }
    };

    const getStockBadge = () => {
        if (isOutOfStock) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        }
        if (availableStock === 0 && inCart > 0) {
            return <Badge variant="secondary">All in Cart</Badge>;
        }
        if (isLowStock) {
            return <Badge variant="warning">Low Stock</Badge>;
        }
        return <Badge variant="success">In Stock</Badge>;
    };

    return (
        <div className="product-detail-page">
            <button className="back-button" onClick={() => navigate('/products')}>
                <ArrowLeft size={18} />
                Back to Products
            </button>

            <div className="product-detail">
                <div className="product-detail-image">
                    <Package size={120} />
                </div>

                <div className="product-detail-info">
                    <div className="product-detail-header">
                        <h1>{product.name}</h1>
                        {getStockBadge()}
                    </div>

                    <p className="product-detail-description">{product.description}</p>

                    <div className="product-detail-price">
                        ${product.price.toFixed(2)}
                    </div>

                    <div className="product-detail-stock">
                        {availableStock} available
                        {inCart > 0 && <span className="in-cart-info"> · {inCart} in cart</span>}
                    </div>

                    {isAuthenticated && !isOutOfStock && (
                        <div className="product-detail-actions">
                            {canAdd ? (
                                <>
                                    <div className="quantity-selector">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="quantity-value">{quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= availableStock}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <Button variant="primary" size="lg" onClick={handleAddToCart}>
                                        <ShoppingCart size={18} />
                                        Add to Cart
                                    </Button>
                                </>
                            ) : (
                                <Button variant="secondary" size="lg" disabled>
                                    All {product.stockQuantity} in Cart
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
