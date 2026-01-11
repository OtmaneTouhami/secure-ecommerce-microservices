import { Package } from 'lucide-react';
import type { Product } from '../types/product.types';
import { Card, CardContent, CardFooter } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useCart } from '@/features/orders/context/CartContext';
import { useAuth } from '@/features/auth';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
    onView?: (id: string) => void;
}

const ProductCard = ({ product, onView }: ProductCardProps) => {
    const { addItem, getAvailableStock, canAddToCart, getItemQuantity } = useCart();
    const { isAuthenticated } = useAuth();

    const availableStock = getAvailableStock(product);
    const inCart = getItemQuantity(product.id);
    const isLowStock = product.stockQuantity <= 10 && product.stockQuantity > 0;
    const isOutOfStock = product.stockQuantity === 0;
    const canAdd = canAddToCart(product);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canAdd) {
            addItem(product, 1);
        }
    };

    const getStockBadge = () => {
        if (isOutOfStock) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        }
        if (availableStock === 0) {
            return <Badge variant="secondary">In Cart</Badge>;
        }
        if (isLowStock) {
            return <Badge variant="warning">Low Stock</Badge>;
        }
        return <Badge variant="success">In Stock</Badge>;
    };

    return (
        <Card
            className="product-card"
            hoverable
            onClick={() => onView?.(product.id)}
        >
            <div className="product-image">
                <Package size={48} />
            </div>
            <CardContent>
                <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    {getStockBadge()}
                </div>
                <p className="product-description">{product.description}</p>
                <div className="product-meta">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <span className="product-stock">
                        {availableStock} available
                        {inCart > 0 && <span className="in-cart"> ({inCart} in cart)</span>}
                    </span>
                </div>
            </CardContent>
            {isAuthenticated && (
                <CardFooter>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddToCart}
                        disabled={!canAdd}
                    >
                        {canAdd ? 'Add to Cart' : availableStock === 0 && inCart > 0 ? 'In Cart' : 'Out of Stock'}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default ProductCard;
