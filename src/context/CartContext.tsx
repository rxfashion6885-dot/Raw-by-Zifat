import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product } from '../types/index.js';
import { api } from '../services/api.js';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isCodAvailable: boolean;
  codRestrictionReason: string;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'rbz_guest_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    api.trackAnalyticsEvent('cart_add', product.id);

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === product.id && i.size === size && i.color === color
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIdx].quantity + quantity, product.stockQuantity);
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          image: product.thumbnail || product.images[0] || '',
          size,
          color,
          quantity: Math.min(quantity, product.stockQuantity),
          unitPrice: product.salePrice || product.price,
          salePrice: product.salePrice,
          costPrice: product.costPrice,
          codAvailable: product.codAvailable !== false,
          maxStock: product.stockQuantity,
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId && i.size === size && i.color === color) {
          return { ...i, quantity: Math.min(quantity, i.maxStock) };
        }
        return i;
      })
    );
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size && i.color === color))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Check product-specific COD eligibility
  const codRestrictedItems = items.filter((i) => !i.codAvailable);
  const isCodAvailable = codRestrictedItems.length === 0;
  const codRestrictionReason =
    codRestrictedItems.length > 0
      ? `Cash on Delivery is unavailable because "${codRestrictedItems[0].name}" requires advance payment (bKash/Nagad).`
      : '';

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        isCodAvailable,
        codRestrictionReason,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
