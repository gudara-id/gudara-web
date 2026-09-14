export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getBestsellers } from '@/lib/products';
import ProductGrid from '@/components/ProductGrid';

export const metadata = {
  title: 'Bestsellers | GUDARA',
  description: 'Produk-produk paling laris di GUDARA.',
};

export default async function BestsellersPage() {
  const products = await getBestsellers(16);

  return (
    <section className="section--tight wrap" style={{ paddingTop: 40 }}>
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/etalase">Shop</Link>
        <span>/</span>
        <span className="breadcrumb__current">Bestsellers</span>
      </nav>

      <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', margin: '8px 0 8px' }}>Bestsellers</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 15, marginBottom: 32, maxWidth: 560 }}>
        Produk paling laris dan paling dicari di GUDARA.
      </p>

      {products.length === 0 ? (
        <div className="search-empty">
          <p>Belum ada produk yang ditandai sebagai bestseller.</p>
          <p style={{ marginTop: 4, fontSize: 13 }}>
            <Link href="/etalase">Lihat semua produk →</Link>
          </p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </section>
  );
}
