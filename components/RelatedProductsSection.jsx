'use client';

import { useEffect, useRef } from 'react';
import ProductGrid from './ProductGrid';
import { logProductEvent } from '@/lib/productEvents';

// Bungkus ProductGrid khusus untuk section "Kamu Mungkin Juga Suka" —
// mencatat 'related_view' sekali per produk yang ditampilkan saat section
// ini muncul, dan meneruskan sourceProductId ke ProductCard supaya klik /
// add-to-cart dari section ini ikut tercatat sebagai 'related_click' /
// 'related_add_to_cart' (lihat lib/productEvents.js untuk cara baca datanya).
export default function RelatedProductsSection({ products, variant, sourceProductId }) {
  const loggedRef = useRef(false);

  useEffect(() => {
    if (loggedRef.current || !products?.length) return;
    loggedRef.current = true;
    products.forEach((p) => logProductEvent('related_view', sourceProductId, p.id));
  }, [products, sourceProductId]);

  return <ProductGrid products={products} variant={variant} trackSourceProductId={sourceProductId} />;
}
