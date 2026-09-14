export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getNewArrivals } from '@/lib/products';
import ProductGrid from '@/components/ProductGrid';

export const metadata = {
  title: 'New Arrivals | GUDARA',
  description: 'Produk-produk terbaru GUDARA — koleksi yang baru saja rilis.',
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(16);

  return (
    <section className="section--tight wrap" style={{ paddingTop: 40 }}>
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/etalase">Shop</Link>
        <span>/</span>
        <span className="breadcrumb__current">New Arrivals</span>
      </nav>

      <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', margin: '8px 0 8px' }}>New Arrivals</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 15, marginBottom: 32, maxWidth: 560 }}>
        Produk yang baru saja rilis di GUDARA — dicek berkala, bukan sekadar seluruh katalog.
      </p>

      {products.length === 0 ? (
        <div className="search-empty">
          <p>Belum ada produk baru yang ditandai saat ini.</p>
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
