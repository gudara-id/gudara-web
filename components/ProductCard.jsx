'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { formatRp } from '@/lib/format';
import { logProductEvent } from '@/lib/productEvents';

export default function ProductCard({ product, variant = 'shop', trackSourceProductId }) {
  const { addToCart } = useCart();
  const isCustom = variant === 'custom';

  // trackSourceProductId cuma diisi kalau card ini dirender di dalam section
  // "Kamu Mungkin Juga Suka" (lihat RelatedProductsSection) — di grid etalase
  // biasa nilainya undefined, jadi tidak ada tracking tambahan di sana.
  function handleRelatedClick() {
    if (trackSourceProductId) logProductEvent('related_click', trackSourceProductId, product.id);
  }

  return (
    <div className="p-card">
      <Link href={`/produk/${product.slug}`} onClick={handleRelatedClick}>
        <div className="p-card__img">
          {product.off && <span className="p-card__badge">{product.off}</span>}
          {isCustom && <span className="p-card__moq-ribbon">Min. Order 12 pcs</span>}
          <Image
            className="p-card__img-main"
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: 'cover' }}
          />
          {product.hoverImage && (
            <Image
              className="p-card__img-hover"
              src={product.hoverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          )}
        </div>
      </Link>
      <div className="p-card__body">
        <div className="eyebrow">GUDARA</div>
        <Link href={`/produk/${product.slug}`} onClick={handleRelatedClick} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="p-card__name">{product.name}</div>
        </Link>
        <div className="p-card__prices">
          <span className="price">{formatRp(product.price)}</span>
          {product.old && <span className="price-old">{formatRp(product.old)}</span>}
        </div>
        {isCustom && <div className="p-card__moq-note">Minimum order 12 pcs / desain</div>}
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
            onClick={() => {
              if (trackSourceProductId) logProductEvent('related_add_to_cart', trackSourceProductId, product.id);
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                variant: '',
              });
            }}
          >
            + Keranjang
          </button>
        )}
      </div>
    </div>
  );
}
