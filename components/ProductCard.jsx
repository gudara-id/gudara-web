'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatRp } from '@/lib/format';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="p-card">
      <Link href={`/produk/${product.slug}`}>
        <div className="p-card__img">
          {product.off && <span className="p-card__badge">{product.off}</span>}
          <img className="p-card__img-main" src={product.image} alt={product.name} loading="lazy" />
          {product.hoverImage && (
            <img className="p-card__img-hover" src={product.hoverImage} alt="" loading="lazy" />
          )}
        </div>
      </Link>
      <div className="p-card__body">
        <div className="eyebrow">GUDARA</div>
        <Link href={`/produk/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="p-card__name">{product.name}</div>
        </Link>
        <div className="p-card__prices">
          <span className="price">{formatRp(product.price)}</span>
          {product.old && <span className="price-old">{formatRp(product.old)}</span>}
        </div>
        <button
          className="p-card__add"
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              variant: '',
            })
          }
        >
          + Keranjang
        </button>
      </div>
    </div>
  );
}
