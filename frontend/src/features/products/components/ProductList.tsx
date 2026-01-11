import type { Product } from '../types/product.types';
import ProductCard from './ProductCard';
import Spinner from '@/components/common/Spinner';
import './ProductList.css';

interface ProductListProps {
    products: Product[];
    loading: boolean;
    error: string | null;
    onProductClick?: (id: string) => void;
}

const ProductList = ({ products, loading, error, onProductClick }: ProductListProps) => {
    if (loading) {
        return (
            <div className="product-list-loading">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-list-error">
                <p>{error}</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="product-list-empty">
                <p>No products found</p>
            </div>
        );
    }

    return (
        <div className="product-list">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onView={onProductClick}
                />
            ))}
        </div>
    );
};

export default ProductList;
