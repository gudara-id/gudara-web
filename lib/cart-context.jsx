'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CART_KEY = 'gudara_cart_v1';
const CartContext = createContext(null);

function readCart() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount (client only).
  useEffect(() => {
    setCart(readCart());
    setHydrated(true);
  }, []);

  // Persist on every change, once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id && i.variant === product.variant);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id && i.variant === product.variant ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
    setDrawerOpen(true);
  }, []);

  const updateQty = useCallback((id, variant, delta) => {
    setCart((prev) => {
      const next = prev
        .map((i) => (i.id === id && i.variant === variant ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0);
      return next;
    });
  }, []);

  const removeLine = useCallback((id, variant) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.variant === variant)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart]);

  const value = {
    cart,
    addToCart,
    updateQty,
    removeLine,
    clearCart,
    cartTotal,
    cartCount,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
