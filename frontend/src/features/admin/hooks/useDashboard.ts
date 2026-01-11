import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/features/products/services/productService';
import { orderService } from '@/features/orders/services/orderService';
import type { Product } from '@/features/products/types/product.types';
import type { Order } from '@/features/orders/types/order.types';

interface DashboardStats {
    totalProducts: number;
    lowStockProducts: number;
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
}

export const useDashboard = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        lowStockProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        deliveredOrders: 0,
    });
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [products, lowStock, orders] = await Promise.all([
                productService.getAll(),
                productService.getLowStock(10),
                orderService.getAll(),
            ]);

            setStats({
                totalProducts: products.length,
                lowStockProducts: lowStock.length,
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => o.status === 'PENDING').length,
                processingOrders: orders.filter(o => o.status === 'PROCESSING').length,
                deliveredOrders: orders.filter(o => o.status === 'DELIVERED').length,
            });

            setLowStockProducts(lowStock);
            setRecentOrders(orders.slice(0, 5));
        } catch {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return { stats, lowStockProducts, recentOrders, loading, error, refetch: fetchDashboardData };
};
