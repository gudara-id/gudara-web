'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabase } from './supabase';

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

  // BUG FIX: harga di cart sebelumnya cuma "snapshot" dari saat produk
  // di-add-to-cart, jadi kalau admin ubah harga produk setelahnya, keranjang
  // yang sudah terisi masih nampilin harga lama sampai halaman di-reload
  // total (checkout sendiri sudah aman karena selalu hitung ulang harga dari
  // database — lihat app/api/checkout/route.js — tapi TAMPILANNYA di
  // keranjang tetap harus sinkron biar tidak membingungkan customer).
  //
  // Jadi begitu cart selesai di-load dari localStorage, kita fetch ulang
  // harga terbaru untuk semua produk yang ada di cart, lalu update di state
  // (dan otomatis ke-persist ke localStorage lewat effect di atas).
  useEffect(() => {
    if (!hydrated || cart.length === 0) return;

    let cancelled = false;

    async function syncPrices() {
      const ids = [...new Set(cart.map((i) => i.id))];
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('products')
          .select('id, price, is_active')
          .in('id', ids);
        if (error || cancelled) return;

        const freshMap = Object.fromEntries(data.map((p) => [p.id, p]));

        setCart((prev) => {
          let changed = false;
          const next = prev
            // Produk yang sudah dihapus/dinonaktifkan admin ikut dibuang dari
            // keranjang, karena tetap akan ditolak saat checkout.
            .filter((i) => {
              const stillValid = freshMap[i.id]?.is_active;
              if (!stillValid) changed = true;
              return stillValid;
            })
            .map((i) => {
              const fresh = freshMap[i.id];
              if (fresh && fresh.price !== i.price) {
                changed = true;
                return { ...i, price: fresh.price };
              }
              return i;
            });
          return changed ? next : prev;
        });
      } catch (err) {
        // Kalau gagal fetch (mis. offline), biarkan harga lama tampil apa
        // adanya — checkout tetap akan pakai harga database yang benar.
        console.error('Gagal sinkronkan harga keranjang:', err?.message);
      }
    }

    syncPrices();
    return () => {
      cancelled = true;
    };
    // Sengaja cuma jalan waktu jumlah/isi id produk di cart berubah (add/remove),
    // bukan tiap qty berubah — supaya tidak spam request tiap klik +/-.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, cart.map((i) => i.id).join(',')]);

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
