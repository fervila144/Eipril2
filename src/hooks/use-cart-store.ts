
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('eipril-cart-v1');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error al cargar el carrito", e);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    // Solo guardamos si hay items o si ya existía algo (para permitir vaciarlo)
    if (items.length > 0 || localStorage.getItem('eipril-cart-v1')) {
      localStorage.setItem('eipril-cart-v1', JSON.stringify(items));
    }
  }, [items]);

  const addItem = (product: Product) => {
    // Comprobamos si ya está en el carrito para la notificación
    const alreadyInCart = items.some(item => item.id === product.id);
    
    if (!alreadyInCart) {
      toast({
        title: "¡Añadido!",
        description: `${product.name} se agregó al carrito.`,
      });
    }

    setItems(currentItems => {
      const itemInCart = currentItems.find(item => item.id === product.id);
      
      if (itemInCart) {
        return currentItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return React.createElement(CartContext.Provider, {
    value: {
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }
  }, children);
}

export function useCartStore() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartStore debe ser usado dentro de un CartProvider');
  }
  return context;
}
