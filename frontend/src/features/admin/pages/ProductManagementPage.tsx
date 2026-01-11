import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { productService } from '@/features/products/services/productService';
import type { Product, ProductRequest } from '@/features/products/types/product.types';
import Button from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';
import ProductFormModal from '../components/ProductFormModal';
import './ProductManagementPage.css';

const ProductManagementPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch {
            console.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCreate = () => {
        setEditingProduct(null);
        setModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productService.delete(id);
            fetchProducts();
        } catch {
            alert('Failed to delete product');
        }
    };

    const handleSubmit = async (data: ProductRequest) => {
        setSaving(true);
        try {
            if (editingProduct) {
                await productService.update(editingProduct.id, data);
            } else {
                await productService.create(data);
            }
            setModalOpen(false);
            fetchProducts();
        } catch {
            alert('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Spinner fullScreen />;
    }

    return (
        <div className="product-management-page">
            <div className="page-header">
                <h1>Product Management</h1>
                <Button onClick={handleCreate}>
                    <Plus size={18} />
                    Add Product
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Products ({products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="product-name">{product.name}</td>
                                    <td className="product-desc">{product.description}</td>
                                    <td>${product.price.toFixed(2)}</td>
                                    <td>{product.stockQuantity}</td>
                                    <td>
                                        {product.stockQuantity === 0 ? (
                                            <Badge variant="destructive">Out of Stock</Badge>
                                        ) : product.stockQuantity <= 10 ? (
                                            <Badge variant="warning">Low Stock</Badge>
                                        ) : (
                                            <Badge variant="success">In Stock</Badge>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn edit"
                                                onClick={() => handleEdit(product)}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {modalOpen && (
                <ProductFormModal
                    product={editingProduct}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleSubmit}
                    isLoading={saving}
                />
            )}
        </div>
    );
};

export default ProductManagementPage;
