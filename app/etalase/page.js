export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getProductRow } from '@/lib/products';
import ProductGrid from '@/components/ProductGrid';
import { titleCase } from '@/lib/format';

export const metadata = { title: 'Etalase | GUDARA' };

export default async function EtalasePage({ searchParams }) {
  const kat = (await searchParams)?.kat;
  const products = await getProductRow(kat, 24);
  const title = kat ? titleCase(kat) : 'Semua Produk';
  const breadcrumb = kat ? `Shop / ${titleCase(kat)}` : 'Shop / Semua Produk';

  return (
    <section className="section--tight wrap" style={{ paddingTop: 40 }}>
      <span className="eyebrow">{breadcrumb}</span>
      <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', margin: '8px 0 24px' }}>{title}</h1>

      <div className="filter-row">
        <Link href="/etalase" className={`filter-pill${!kat ? ' active' : ''}`}>Semua</Link>
        <Link href="/etalase?kat=daily" className={`filter-pill${kat === 'daily' ? ' active' : ''}`}>Daily &amp; Casual</Link>
        <Link href="/etalase?kat=sport" className={`filter-pill${kat === 'sport' ? ' active' : ''}`}>Sport Authentic</Link>
        <Link href="/etalase?kat=basic" className={`filter-pill${kat === 'basic' ? ' active' : ''}`}>Basic</Link>
      </div>

      <div style={{ marginBottom: 80 }}>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
