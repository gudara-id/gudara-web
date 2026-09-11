export const dynamic = 'force-dynamic';
 
import Link from 'next/link';
import { getProductPage, getCategoryTree, GENDERS } from '@/lib/products';
import ProductGrid from '@/components/ProductGrid';
import Pagination from '@/components/Pagination';
import SortSelect from '@/components/SortSelect';
import SearchBox from '@/components/SearchBox';
import { titleCase } from '@/lib/format';
 
export const metadata = { title: 'Etalase | GUDARA' };
 
const VALID_SORTS = ['newest', 'price-asc', 'price-desc'];
const VALID_GENDERS = GENDERS.map((g) => g.value);
 
// Bangun query string etalase, menjaga filter lain (gender/kategori/sort/q)
// tetap ada saat salah satu filter pill diklik — supaya kombinasi gender +
// kategori sekaligus bisa di-bookmark/di-share sebagai satu URL.
function buildEtalaseHref(sp, overrides) {
  const params = new URLSearchParams();
  const merged = { kat: sp?.kat, gender: sp?.gender, q: sp?.q, sort: sp?.sort, ...overrides };
  Object.entries(merged).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `/etalase?${qs}` : '/etalase';
}
 
export default async function EtalasePage({ searchParams }) {
  const sp = await searchParams;
  const kat = sp?.kat;
  const gender = VALID_GENDERS.includes(sp?.gender) ? sp.gender : '';
  const q = sp?.q?.trim() || '';
  const sort = VALID_SORTS.includes(sp?.sort) ? sp.sort : 'newest';
  const page = Math.max(1, parseInt(sp?.page, 10) || 1);
  const [{ items: products, total, totalPages }, categoryTree] = await Promise.all([
    getProductPage(kat, page, 24, sort, q, { excludeCustom: true, gender }),
    getCategoryTree(),
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
        <Link href={buildEtalaseHref(sp, { kat: null, page: null })} className={`filter-pill${!kat && !q ? ' active' : ''}`}>Semua</Link>
        {categoryTree
          .filter((c) => c.slug !== 'custom')
          .map((c) => (
            <span key={c.slug} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Link href={buildEtalaseHref(sp, { kat: c.slug, page: null })} className={`filter-pill${kat === c.slug ? ' active' : ''}`}>
                {c.name}
              </Link>
              {/* Sub-kategori (mis. Badminton/Running/Sepak Bola di bawah
                  "Sport Authentic") tampil sebagai pill lebih kecil menempel
                  di sebelah induknya, bukan sejajar sebagai kategori utama —
                  supaya jelas keduanya masih 1 grup "Sport Authentic". */}
              {c.children.map((child) => (
                <Link
                  key={child.slug}
                  href={buildEtalaseHref(sp, { kat: child.slug, page: null })}
                  className={`filter-pill filter-pill--sub${kat === child.slug ? ' active' : ''}`}
                >
                  {child.name}
                </Link>
              ))}
            </span>
          ))}
      </div>

      <div className="filter-row" style={{ marginTop: 8 }}>
        <Link href={buildEtalaseHref(sp, { gender: null, page: null })} className={`filter-pill${!gender ? ' active' : ''}`}>
          Semua Gender
        </Link>
        {GENDERS.map((g) => (
          <Link
            key={g.value}
            href={buildEtalaseHref(sp, { gender: g.value, page: null })}
            className={`filter-pill${gender === g.value ? ' active' : ''}`}
          >
            {g.label}
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
