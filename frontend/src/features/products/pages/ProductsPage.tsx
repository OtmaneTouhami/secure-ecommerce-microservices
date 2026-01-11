import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductList from '../components/ProductList';
import ProductSearch from '../components/ProductSearch';
import './ProductsPage.css';

const ProductsPage = () => {
    const { products, loading, error, searchProducts } = useProducts();
    const navigate = useNavigate();

    const handleProductClick = (id: string) => {
        navigate(`/products/${id}`);
    };

    return (
        <div className="products-page">
            <div className="products-header">
                <h1>Product Catalog</h1>
                <ProductSearch onSearch={searchProducts} />
            </div>
            <ProductList
                products={products}
                loading={loading}
                error={error}
                onProductClick={handleProductClick}
            />
        </div>
    );
};

export default ProductsPage;
