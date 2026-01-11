import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Product, ProductRequest } from '@/features/products/types/product.types';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import './ProductFormModal.css';

interface ProductFormModalProps {
    product: Product | null;
    onClose: () => void;
    onSubmit: (data: ProductRequest) => void;
    isLoading: boolean;
}

const ProductFormModal = ({ product, onClose, onSubmit, isLoading }: ProductFormModalProps) => {
    const [formData, setFormData] = useState<ProductRequest>({
        name: '',
        description: '',
        price: 0,
        stockQuantity: 0,
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                stockQuantity: product.stockQuantity,
            });
        }
    }, [product]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{product ? 'Edit Product' : 'Create Product'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <Input
                        label="Product Name"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div className="input-wrapper">
                        <label htmlFor="description" className="input-label">Description</label>
                        <textarea
                            id="description"
                            className="textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <Input
                            label="Price ($)"
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            required
                        />

                        <Input
                            label="Stock Quantity"
                            id="stock"
                            type="number"
                            min="0"
                            value={formData.stockQuantity}
                            onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {product ? 'Save Changes' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
