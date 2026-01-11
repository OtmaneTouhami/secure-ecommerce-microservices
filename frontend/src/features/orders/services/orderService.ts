import api from '@/services/api';
import type { Order, OrderRequest, OrderItem, OrderStatus } from '../types/order.types';

const BASE_URL = '/command-service/api/orders';

export const orderService = {
    // Client endpoints
    getMyOrders: async (): Promise<Order[]> => {
        const response = await api.get<Order[]>(`${BASE_URL}/my-orders`);
        return response.data;
    },

    create: async (order: OrderRequest): Promise<Order> => {
        const response = await api.post<Order>(BASE_URL, order);
        return response.data;
    },

    getById: async (id: string): Promise<Order> => {
        const response = await api.get<Order>(`${BASE_URL}/${id}`);
        return response.data;
    },

    getOrderItems: async (id: string): Promise<OrderItem[]> => {
        const response = await api.get<OrderItem[]>(`${BASE_URL}/${id}/items`);
        return response.data;
    },

    cancel: async (id: string): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    },

    // Admin endpoints
    getAll: async (): Promise<Order[]> => {
        const response = await api.get<Order[]>(BASE_URL);
        return response.data;
    },

    getByStatus: async (status: OrderStatus): Promise<Order[]> => {
        const response = await api.get<Order[]>(`${BASE_URL}/status/${status}`);
        return response.data;
    },

    updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
        const response = await api.put<Order>(`${BASE_URL}/${id}/status`, null, {
            params: { status },
        });
        return response.data;
    },
};
