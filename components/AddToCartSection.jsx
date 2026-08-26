'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';

export default function AddToCartSection({ product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);

  function handleAdd() {
    if (!selectedSize) {
      alert('Pilih ukuran dulu ya.');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      variant: selectedSize,
    });
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Ukuran</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {product.sizes.map((s) => (
            <button
              key={s}
              className="size-btn"
              style={{
                width: 44,
                height: 44,
                border: '1px solid var(--line)',
                fontFamily: 'var(--mono)',
                background: selectedSize === s ? 'var(--ink)' : '',
                color: selectedSize === s ? '#fff' : '',
              }}
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
    </>
  );
}
