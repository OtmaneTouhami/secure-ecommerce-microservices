import api from '@/services/api';
import type { Product, ProductRequest } from '../types/product.types';

const BASE_URL = '/product-service/api/products';

export const productService = {
    getAll: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>(BASE_URL);
        return response.data;
    },

    getById: async (id: string): Promise<Product> => {
        const response = await api.get<Product>(`${BASE_URL}/${id}`);
        return response.data;
    },

    search: async (name: string): Promise<Product[]> => {
        const response = await api.get<Product[]>(`${BASE_URL}/search`, {
            params: { name },
        });
        return response.data;
    },

    getInStock: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>(`${BASE_URL}/in-stock`);
        return response.data;
    },

    getLowStock: async (threshold: number = 10): Promise<Product[]> => {
        const response = await api.get<Product[]>(`${BASE_URL}/low-stock`, {
            params: { threshold },
        });
        return response.data;
    },

    create: async (product: ProductRequest): Promise<Product> => {
        const response = await api.post<Product>(BASE_URL, product);
        return response.data;
    },

    update: async (id: string, product: ProductRequest): Promise<Product> => {
        const response = await api.put<Product>(`${BASE_URL}/${id}`, product);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    },

    checkStock: async (id: string, quantity: number): Promise<boolean> => {
        const response = await api.get<boolean>(`${BASE_URL}/${id}/check-stock`, {
            params: { quantity },
        });
        return response.data;
    },

    reduceStock: async (id: string, quantity: number): Promise<void> => {
        await api.put(`${BASE_URL}/${id}/reduce-stock`, null, {
            params: { quantity },
        });
    },
};
