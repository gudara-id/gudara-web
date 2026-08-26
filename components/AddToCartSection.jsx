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
      <div className="pdp-block">
        <div className="eyebrow" style={{ marginBottom: 8 }}>Ukuran</div>
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
    </>
  );
}
