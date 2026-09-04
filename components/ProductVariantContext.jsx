'use client';

import { createContext, useContext, useMemo, useState } from 'react';

// ProductGallery (kolom kiri) dan AddToCartSection (kolom kanan, di dalam
// .pdp-info) bukan komponen bertetangga di app/produk/[slug]/page.js — jadi
// state "warna yang lagi dipilih" tidak bisa lewat props biasa. Context ini
// jadi satu-satunya sumber kebenaran buat warna terpilih, supaya klik warna
// di panel beli langsung ganti foto galeri di sebelahnya.
const ProductVariantContext = createContext(null);

export function ProductVariantProvider({ product, children }) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);

  // product.imagesByColor sudah dihitung sekali di server (lib/products.js)
  // dan tidak berubah — jadi array per warna di dalamnya referensinya stabil,
  // aman dipakai sebagai `key` React di ProductGalleryConnected.
  const images = useMemo(() => {
    if (selectedColor && product.imagesByColor?.[selectedColor]?.length) {
      return product.imagesByColor[selectedColor];
    }
    return product.images;
  }, [selectedColor, product]);

  const value = useMemo(
    () => ({ selectedColor, setSelectedColor, images, colors: product.colors || [] }),
    [selectedColor, images, product.colors]
  );

  return <ProductVariantContext.Provider value={value}>{children}</ProductVariantContext.Provider>;
}

export function useProductVariant() {
  const ctx = useContext(ProductVariantContext);
  if (!ctx) {
    throw new Error('useProductVariant() must be used inside <ProductVariantProvider>');
  }
  return ctx;
}
