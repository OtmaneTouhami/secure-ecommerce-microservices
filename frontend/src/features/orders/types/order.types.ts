export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';

export interface OrderItem {
    id: number;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface Order {
    id: string;
    userId: string;
    username: string;
    status: OrderStatus;
    totalAmount: number;
    items: OrderItem[];
    orderDate: string;
    updatedAt: string;
}

export interface OrderItemRequest {
    productId: string;
    quantity: number;
}

export interface OrderRequest {
    items: OrderItemRequest[];
}
