import React, { createContext, useContext, useState, useCallback } from 'react';
import { Extra } from '@/lib/menuData';

export interface CartItemCustomization {
  removedIngredients: string[];
  addedExtras: Extra[];
  notes: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
  customization?: CartItemCustomization;
  customizationPrice?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemCustomization: (id: string, customization: CartItemCustomization, customizationPrice: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const customizationKey = item.customization ? JSON.stringify(item.customization) : '';
      
      const existing = prev.find(i => {
        const existingCustomKey = i.customization ? JSON.stringify(i.customization) : '';
        return i.id === item.id && existingCustomKey === customizationKey;
      });
      
      if (existing) {
        return prev.map(i => {
          const existingCustomKey = i.customization ? JSON.stringify(i.customization) : '';
          const itemCustomKey = item.customization ? JSON.stringify(item.customization) : '';
          return i.id === item.id && existingCustomKey === itemCustomKey ? { ...i, quantity: i.quantity + 1 } : i;
        });
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    }
  }, []);

  const updateItemCustomization = useCallback((id: string, customization: CartItemCustomization, customizationPrice: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, customization, customizationPrice } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, item) => {
    const basePrice = item.price * item.quantity;
    const customPrice = (item.customizationPrice || 0) * item.quantity;
    return sum + basePrice + customPrice;
  }, 0);
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, updateItemCustomization, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function getCartItemDisplayId(item: CartItem): string {
  const customizationKey = item.customization ? JSON.stringify(item.customization) : '';
  return `${item.id}-${customizationKey}`;
}
