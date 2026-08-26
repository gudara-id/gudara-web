'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';

export default function AddToCartSection({ product }) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || null);
  const [selectedSize, setSelectedSize] = useState(null);

  function handleAdd() {
    if (product.colors.length > 0 && !selectedColor) {
      alert('Pilih warna dulu ya.');
      return;
    }
    if (!selectedSize) {
      alert('Pilih ukuran dulu ya.');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      variant: [selectedColor, selectedSize].filter(Boolean).join(' / '),
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
                onClick={() => setSelectedColor(c)}
                type="button"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pdp-block">
        <div className="pdp-block__head">
          <div className="eyebrow">Ukuran</div>
          <a href="#" className="pdp-size-guide">Panduan Ukuran</a>
        </div>
        <div className="pdp-sizes">
          {product.sizes.map((s) => (
            <button
              key={s}
              className={`pdp-size-btn${selectedSize === s ? ' is-active' : ''}`}
              onClick={() => setSelectedSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn--dark"
        style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
        onClick={handleAdd}
      >
        Tambah ke Keranjang
      </button>
      <a
        href={`https://wa.me/628131648947?text=Halo%20Admin%20Gudara%2C%20saya%20mau%20tanya%20stok%20${encodeURIComponent(product.name)}`}
        className="btn btn--outline"
        style={{ width: '100%', justifyContent: 'center', color: 'var(--ink)', borderColor: 'var(--ink)' }}
      >
        Tanya via WhatsApp
      </a>

      <div className="pdp-info-rows">
        <div className="pdp-info-row">
          <span>Dikirim dari Bandung, 1–2 hari kerja</span>
          <span className="pdp-info-row__chevron">&rsaquo;</span>
        </div>
        <div className="pdp-info-row">
          <span>Kumpulkan poin di GUDARA Rewards</span>
          <span className="pdp-info-row__chevron">&rsaquo;</span>
        </div>
      </div>
    </>
  );
}
