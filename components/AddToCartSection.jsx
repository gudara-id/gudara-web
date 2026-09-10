'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { useProductVariant } from './ProductVariantContext';

export default function AddToCartSection({ product, hideAddToCart = false, sizeChartUrl = null }) {
  const { cart, addToCart } = useCart();
  // selectedColor datang dari ProductVariantProvider (dibungkus di
  // app/produk/[slug]/page.js) supaya klik warna di sini juga mengganti
  // foto galeri di ProductGalleryConnected — bukan cuma dipakai di sini.
  const { selectedColor, setSelectedColor } = useProductVariant();
  const [selectedSize, setSelectedSize] = useState(null);
  // Inline message instead of window.alert(): alert() is commonly blocked or
  // silently swallowed inside in-app browsers (Instagram/TikTok/WhatsApp),
  // which is where most shoppers land from — so a blocked alert made
  // "Tambah ke Keranjang" look completely dead with zero feedback.
  const [notice, setNotice] = useState('');

  // product.variants ([]  kalau produk belum punya varian sama sekali, mis.
  // produk lama) dipakai untuk mencocokkan warna+ukuran yang dipilih ke satu
  // baris product_variants — supaya kita tahu variant_id-nya (dikirim ke
  // checkout, bukan cuma teks label) dan sisa stoknya.
  function matchVariant(color, size) {
    if (!product.variants?.length) return null;
    return (
      product.variants.find(
        (v) => (v.size || null) === (size || null) && (v.color || null) === (color || null)
      ) || null
    );
  }

  const matchedVariant = matchVariant(selectedColor, selectedSize);

  function handleAdd() {
    if (product.colors.length > 0 && !selectedColor) {
      setNotice('Pilih warna dulu ya.');
      return;
    }
    if (!selectedSize) {
      setNotice('Pilih ukuran dulu ya.');
      return;
    }
    if (product.variants?.length && !matchedVariant) {
      setNotice('Kombinasi warna & ukuran ini tidak tersedia.');
      return;
    }
    if (matchedVariant) {
      const alreadyInCart = cart
        .filter((i) => i.id === product.id && i.variantId === matchedVariant.id)
        .reduce((sum, i) => sum + i.qty, 0);
      if (matchedVariant.stock <= 0) {
        setNotice('Stok untuk pilihan ini sedang habis.');
        return;
      }
      if (alreadyInCart >= matchedVariant.stock) {
        setNotice(`Stok tersisa cuma ${matchedVariant.stock}, sudah ada di keranjang.`);
        return;
      }
    }
    setNotice('');
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      variant: [selectedColor, selectedSize].filter(Boolean).join(' / '),
      variantId: matchedVariant?.id || null,
    });
  }

  return (
    <>
      {product.colors.length > 0 && (
        <div className="pdp-block">
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Warna <span style={{ opacity: 0.6 }}>{product.colors.length}</span>
            {selectedColor ? ` — ${selectedColor}` : ''}
          </div>
          <div className="pdp-swatches">
            {product.colors.map((c) => (
              <button
                key={c}
                className={`pdp-swatch${selectedColor === c ? ' is-active' : ''}`}
                onClick={() => {
                  setSelectedColor(c);
                  setNotice('');
                }}
                type="button"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {!hideAddToCart && (
        <div className="pdp-block">
          <div className="pdp-block__head">
            <div className="eyebrow">Ukuran</div>
            {sizeChartUrl ? (
              <a href={sizeChartUrl} target="_blank" rel="noopener noreferrer" className="pdp-size-guide">
                Panduan Ukuran
              </a>
            ) : (
              <a href="#panduan-ukuran" className="pdp-size-guide">Panduan Ukuran</a>
            )}
          </div>
          <div className="pdp-sizes">
            {product.sizes.map((s) => {
              // Kalau produk punya data varian, cek stok kombinasi warna
              // (yang lagi dipilih) + ukuran ini supaya ukuran yang habis
              // kelihatan beda (dicoret) sebelum pembeli sempat pilih.
              const v = matchVariant(selectedColor, s);
              const sizeOutOfStock = product.variants?.length && v && v.stock <= 0;
              return (
                <button
                  key={s}
                  className={`pdp-size-opt${selectedSize === s ? ' is-active' : ''}`}
                  style={sizeOutOfStock ? { opacity: 0.4, textDecoration: 'line-through' } : undefined}
                  onClick={() => {
                    setSelectedSize(s);
                    setNotice('');
                  }}
                  type="button"
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {notice && (
        <p style={{ color: '#C6302B', fontSize: 13, marginBottom: 12 }}>{notice}</p>
      )}

      {!hideAddToCart && (
        <button
          className="btn btn--dark"
          style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
          onClick={handleAdd}
        >
          Tambah ke Keranjang
        </button>
      )}
      <a
        href={`https://wa.me/628131648947?text=Halo%20Admin%20Gudara%2C%20saya%20mau%20tanya%20${
          hideAddToCart ? 'custom' : 'stok'
        }%20${encodeURIComponent(product.name)}`}
        className={hideAddToCart ? 'btn btn--dark' : 'btn btn--outline'}
        style={{
          width: '100%',
          justifyContent: 'center',
          marginBottom: 4,
          color: hideAddToCart ? undefined : 'var(--ink)',
          borderColor: hideAddToCart ? undefined : 'var(--ink)',
        }}
      >
        Tanya via WhatsApp
      </a>
    </>
  );
}
