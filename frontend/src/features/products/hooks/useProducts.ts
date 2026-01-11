import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types/product.types';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, []);

    const searchProducts = useCallback(async (query: string) => {
        if (!query.trim()) {
            fetchProducts();
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await productService.search(query);
            setProducts(data);
        } catch {
            setError('Search failed');
        } finally {
            setLoading(false);
        }
    }, [fetchProducts]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading, error, refetch: fetchProducts, searchProducts };
};

export const useProduct = (id: string) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await productService.getById(id);
                setProduct(data);
            } catch {
                setError('Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    return { product, loading, error };
};
