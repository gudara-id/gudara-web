'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatRp } from '@/lib/format';

export default function ProductCard({ product, variant = 'shop' }) {
  const { addToCart } = useCart();
  const isCustom = variant === 'custom';

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
        {isCustom ? (
          <a
            className="p-card__add"
            href={`https://wa.me/628131648947?text=${encodeURIComponent(
              `Halo Admin Gudara, saya ingin custom desain "${product.name}"`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
          >
            Chat Admin
          </a>
        ) : (
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
        )}
      </div>
    </div>
  );
}
