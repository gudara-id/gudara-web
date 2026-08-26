export const dynamic = 'force-dynamic';
 
import Link from 'next/link';
import { getProductRow } from '@/lib/products';
import ProductGrid from '@/components/ProductGrid';
import SortSelect from '@/components/SortSelect';
import { titleCase } from '@/lib/format';
 
export const metadata = { title: 'Etalase | GUDARA' };
 
const VALID_SORTS = ['newest', 'price-asc', 'price-desc'];
 
export default async function EtalasePage({ searchParams }) {
  const sp = await searchParams;
  const kat = sp?.kat;
  const sort = VALID_SORTS.includes(sp?.sort) ? sp.sort : 'newest';
  const products = await getProductRow(kat, 24, sort);
  const title = kat ? titleCase(kat) : 'Semua Produk';
 
  return (
    <section className="section--tight wrap" style={{ paddingTop: 40 }}>
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        {kat ? (
          <>
            <Link href="/etalase">Shop</Link>
            <span>/</span>
            <span className="breadcrumb__current">{title}</span>
          </>
        ) : (
          <span className="breadcrumb__current">Shop</span>
        )}
      </nav>
 
      <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', margin: '8px 0 24px' }}>{title}</h1>
 
      <div className="filter-row">
        <Link href="/etalase" className={`filter-pill${!kat ? ' active' : ''}`}>Semua</Link>
        <Link href="/etalase?kat=daily" className={`filter-pill${kat === 'daily' ? ' active' : ''}`}>Daily &amp; Casual</Link>
        <Link href="/etalase?kat=sport" className={`filter-pill${kat === 'sport' ? ' active' : ''}`}>Sport Authentic</Link>
        <Link href="/etalase?kat=basic" className={`filter-pill${kat === 'basic' ? ' active' : ''}`}>Basic</Link>
      </div>
 
      <div className="etalase-toolbar">
        <span className="etalase-count">{products.length} produk</span>
        <SortSelect current={sort} />
      </div>
 
      <div style={{ marginBottom: 80 }}>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
 
