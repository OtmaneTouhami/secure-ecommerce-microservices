import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Product } from '@/features/products/types/product.types';

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
    getItemQuantity: (productId: string) => number;
    getAvailableStock: (product: Product) => number;
    canAddToCart: (product: Product) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const getItemQuantity = useCallback((productId: string): number => {
        const item = items.find((i) => i.product.id === productId);
        return item?.quantity || 0;
    }, [items]);

    const getAvailableStock = useCallback((product: Product): number => {
        const inCart = getItemQuantity(product.id);
        return Math.max(0, product.stockQuantity - inCart);
    }, [getItemQuantity]);

    const canAddToCart = useCallback((product: Product): boolean => {
        return getAvailableStock(product) > 0;
    }, [getAvailableStock]);

    const addItem = useCallback((product: Product, quantity: number = 1) => {
        const available = getAvailableStock(product);
        if (available <= 0) return;

        const actualQuantity = Math.min(quantity, available);

        setItems((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + actualQuantity }
                        : item
                );
            }
            return [...prev, { product, quantity: actualQuantity }];
        });
    }, [getAvailableStock]);

    const removeItem = useCallback((productId: string) => {
        setItems((prev) => prev.filter((item) => item.product.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }

        setItems((prev) =>
            prev.map((item) =>
                item.product.id === productId
                    ? { ...item, quantity: Math.min(quantity, item.product.stockQuantity) }
                    : item
            )
        );
    }, [removeItem]);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                totalAmount,
                getItemQuantity,
                getAvailableStock,
                canAddToCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
