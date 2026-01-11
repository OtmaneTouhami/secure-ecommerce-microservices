export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductRequest {
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
}
