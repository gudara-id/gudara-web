export const dynamic = 'force-dynamic';
 
import Link from 'next/link';
import { getProductPage, getCategories } from '@/lib/products';
import ProductGrid from '@/components/ProductGrid';
import Pagination from '@/components/Pagination';
import SortSelect from '@/components/SortSelect';
import SearchBox from '@/components/SearchBox';
import { titleCase } from '@/lib/format';
 
export const metadata = { title: 'Etalase | GUDARA' };
 
const VALID_SORTS = ['newest', 'price-asc', 'price-desc'];
 
export default async function EtalasePage({ searchParams }) {
  const sp = await searchParams;
  const kat = sp?.kat;
  const q = sp?.q?.trim() || '';
  const sort = VALID_SORTS.includes(sp?.sort) ? sp.sort : 'newest';
  const page = Math.max(1, parseInt(sp?.page, 10) || 1);
  const [{ items: products, total, totalPages }, categories] = await Promise.all([
    getProductPage(kat, page, 24, sort, q, { excludeCustom: true }),
    getCategories(),
  ]);
  const title = q ? `Hasil untuk "${q}"` : kat ? titleCase(kat) : 'Semua Produk';
 
  return (
    <section className="section--tight wrap" style={{ paddingTop: 40 }}>
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        {kat && !q ? (
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
        <Link href="/etalase" className={`filter-pill${!kat && !q ? ' active' : ''}`}>Semua</Link>
        {categories
          .filter((c) => c.slug !== 'custom')
          .map((c) => (
            <Link key={c.slug} href={`/etalase?kat=${c.slug}`} className={`filter-pill${kat === c.slug ? ' active' : ''}`}>
              {c.name}
            </Link>
          ))}
      </div>
 
      <div className="etalase-toolbar">
        <SearchBox current={q} />
        <div className="etalase-toolbar__actions">
          <span className="etalase-count">{total} produk</span>
          <SortSelect current={sort} />
        </div>
      </div>
 
      {products.length === 0 ? (
        <div className="search-empty">
          <p>
            Tidak ada produk yang cocok dengan <strong>&quot;{q}&quot;</strong>.
          </p>
          <p style={{ marginTop: 4, fontSize: 13 }}>Coba kata kunci lain, atau lihat semua produk.</p>
        </div>
      ) : (
        <div style={{ marginBottom: 0 }}>
          <ProductGrid products={products} />
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} searchParams={sp} />
    </section>
  );
}
