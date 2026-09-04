import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { formatRp, titleCase } from '@/lib/format';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import AdminNav from '@/components/AdminNav';

const TABS = ['all', 'daily', 'sport', 'basic', 'custom'];
const IMAGE_EXTENSION_RE = /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i;

export const dynamic = 'force-dynamic';

function firstThumb(images) {
  const sorted = (images || []).slice().sort((a, b) => a.sort_order - b.sort_order);
  const hit = sorted.find((img) => IMAGE_EXTENSION_RE.test(img.url || ''));
  return hit?.url || null;
}

export default async function AdminProductsPage({ searchParams }) {
  const supabase = getSupabaseAdmin();
  const params = await searchParams;
  const filter = params?.category || 'all';

  let query = supabase
    .from('products')
    .select('id, slug, name, category, price, compare_price, is_active, created_at, product_images(url, sort_order), product_variants(stock)')
    .order('created_at', { ascending: false });

  if (filter !== 'all') query = query.eq('category', filter);

  const { data: products, error } = await query;

  return (
    <section className="wrap admin-shell">
      <AdminNav />
      <div className="admin-head">
        <div>
          <h1>Produk</h1>
          <p className="admin-head__meta">{products?.length || 0} produk ditemukan</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/produk/baru" className="btn btn--dark" style={{ fontSize: 13 }}>
            + Tambah Produk
          </Link>
          <AdminLogoutButton />
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map((c) => (
          <Link
            key={c}
            href={`/admin/produk?category=${c}`}
            className={`admin-tab${filter === c ? ' is-active' : ''}`}
          >
            {c === 'all' ? 'Semua' : titleCase(c)}
          </Link>
        ))}
      </div>

      {error && <p style={{ color: '#C6302B', marginBottom: 16 }}>Gagal memuat data: {error.message}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(products || []).map((p) => {
              const thumb = firstThumb(p.product_images);
              const totalStock = (p.product_variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
              return (
                <tr key={p.id}>
                  <td>
                    {thumb ? (
                      <img src={thumb} alt="" className="admin-thumb" />
                    ) : (
                      <div className="admin-thumb" />
                    )}
                  </td>
                  <td>
                    <Link href={`/admin/produk/${p.id}`}>{p.name}</Link>
                  </td>
                  <td>{titleCase(p.category)}</td>
                  <td>{formatRp(p.price)}</td>
                  <td>{totalStock}</td>
                  <td>
                    <span className="admin-status">
                      <span className="admin-status__dot" style={{ background: p.is_active ? '#16A34A' : '#9CA3AF' }} />
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {products?.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty">Belum ada produk pada kategori ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
