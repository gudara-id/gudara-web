export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/products';
import { formatRp, titleCase } from '@/lib/format';
import AddToCartSection from '@/components/AddToCartSection';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} | GUDARA` : 'Produk | GUDARA' };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <section className="wrap" style={{ padding: '48px 0 96px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56 }}>
        <div>
          <div style={{ aspectRatio: '4/5', background: 'var(--surface)', overflow: 'hidden' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
        <div>
          <span className="eyebrow">GUDARA — {titleCase(product.kat)}</span>
          <h1
            style={{
              fontSize: 'clamp(28px,4vw,44px)',
              margin: '8px 0 16px',
              textTransform: 'uppercase',
              fontFamily: 'var(--display)',
            }}
          >
            {product.name}
          </h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 20 }}>
            <span className="price" style={{ fontSize: 22 }}>{formatRp(product.price)}</span>
            {product.old && <span className="price-old" style={{ fontSize: 16 }}>{formatRp(product.old)}</span>}
            {product.off && (
              <span
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  padding: '3px 8px',
                }}
              >
                {product.off}
              </span>
            )}
          </div>

          {product.materialSpec && (
            <div style={{ marginBottom: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Spesifikasi Material</div>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{product.materialSpec}</p>
            </div>
          )}

          {product.colors.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Varian</div>
              <div>{product.colors.join(' / ')}</div>
            </div>
          )}

          <AddToCartSection product={product} />
        </div>
      </div>
    </section>
  );
}
