import { useState, useEffect } from 'react';
import { productService } from '@/features/products/services/productService';
import type { Product } from '@/features/products/types/product.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';
import { AlertTriangle } from 'lucide-react';
import './LowStockPage.css';

const LowStockPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [threshold, setThreshold] = useState(10);

    useEffect(() => {
        const fetchLowStock = async () => {
            setLoading(true);
            try {
                const data = await productService.getLowStock(threshold);
                setProducts(data);
            } catch {
                console.error('Failed to fetch low stock products');
            } finally {
                setLoading(false);
            }
        };

        fetchLowStock();
    }, [threshold]);

    if (loading) {
        return <Spinner fullScreen />;
    }

    return (
        <div className="low-stock-page">
            <div className="page-header">
                <h1>
                    <AlertTriangle size={28} />
                    Low Stock Alert
                </h1>
                <div className="threshold-control">
                    <label>Threshold:</label>
                    <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(parseInt(e.target.value) || 10)}
                        min="1"
                        className="threshold-input"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Products with low stock ({products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <div className="no-alerts">
                            <p>All products are well stocked!</p>
                        </div>
                    ) : (
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="product-name">{product.name}</td>
                                        <td className="product-desc">{product.description}</td>
                                        <td>${product.price.toFixed(2)}</td>
                                        <td className="stock-qty">{product.stockQuantity}</td>
                                        <td>
                                            {product.stockQuantity === 0 ? (
                                                <Badge variant="destructive">Out of Stock</Badge>
                                            ) : (
                                                <Badge variant="warning">Low Stock</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LowStockPage;
