import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';
import type { Order } from '../types/order.types';

export const useOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await orderService.getMyOrders();
            setOrders(data);
        } catch {
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { orders, loading, error, refetch: fetchOrders };
};

export const useOrder = (id: string) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await orderService.getById(id);
            setOrder(data);
        } catch {
            setError('Failed to fetch order');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    return { order, loading, error, refetch: fetchOrder };
};
