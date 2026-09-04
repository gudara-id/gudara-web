'use client';

import ProductGallery from './ProductGallery';
import { useProductVariant } from './ProductVariantContext';

// `key={selectedColor}` sengaja dipakai supaya ProductGallery di-remount
// total tiap ganti warna — state internalnya (foto aktif, lightbox, foto
// yang gagal dimuat) mengacu ke index di array `images` lama, jadi kalau
// dibiarkan "hidup" pas array-nya berganti isi, bisa nyangkut di index yang
// sudah tidak nyambung dengan foto varian yang baru.
export default function ProductGalleryConnected({ name }) {
  const { images, selectedColor } = useProductVariant();
  return <ProductGallery key={selectedColor || 'default'} images={images} name={name} />;
}
