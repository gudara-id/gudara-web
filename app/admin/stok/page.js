import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { titleCase } from '@/lib/format';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import AdminNav from '@/components/AdminNav';
import StockTable from '@/components/StockTable';

export const dynamic = 'force-dynamic';

export default async function AdminStockPage() {
  const supabase = getSupabaseAdmin();
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, category, is_active, product_variants(id, color, size, sku, stock, price_override), product_images(url, sort_order)')
    .order('name', { ascending: true });

  // Ratakan jadi satu baris per varian (bukan per produk) supaya semua stok
  // kelihatan dan bisa dicari/difilter dalam satu tabel — produk tanpa
  // varian sama sekali tetap muncul sebagai satu baris "tanpa varian".
  const rows = [];
  for (const p of products || []) {
    const thumb = (p.product_images || []).slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url || null;
    if (!p.product_variants || p.product_variants.length === 0) {
      rows.push({
        productId: p.id,
        productName: p.name,
        category: titleCase(p.category),
        thumb,
        variantId: null,
        color: '',
        size: '',
        sku: '',
        stock: null, // null = belum ada varian sama sekali, bukan stok 0
      });
    } else {
      for (const v of p.product_variants) {
        rows.push({
          productId: p.id,
          productName: p.name,
          category: titleCase(p.category),
          thumb,
          variantId: v.id,
          color: v.color || '',
          size: v.size || '',
          sku: v.sku || '',
          stock: v.stock ?? 0,
        });
      }
    }
  }

  const totalStock = rows.reduce((sum, r) => sum + (r.stock || 0), 0);
  const outOfStockCount = rows.filter((r) => r.stock === 0).length;
  const lowStockCount = rows.filter((r) => r.stock !== null && r.stock > 0 && r.stock <= 5).length;

  return (
    <section className="wrap admin-shell">
      <AdminNav />
      <div className="admin-head">
        <div>
          <h1>Stok</h1>
          <p className="admin-head__meta">{rows.length} varian &middot; total stok {totalStock} pcs</p>
        </div>
        <AdminLogoutButton />
      </div>

      {error && <p style={{ color: '#C6302B', marginBottom: 16 }}>Gagal memuat data: {error.message}</p>}

      <div className="admin-stock-summary">
        <div className="admin-stock-summary__item">
          <span className="admin-stock-summary__num">{totalStock}</span>
          <span>Total stok (pcs)</span>
        </div>
        <div className="admin-stock-summary__item is-warn">
          <span className="admin-stock-summary__num">{lowStockCount}</span>
          <span>Stok menipis (&le;5)</span>
        </div>
        <div className="admin-stock-summary__item is-danger">
          <span className="admin-stock-summary__num">{outOfStockCount}</span>
          <span>Habis (stok 0)</span>
        </div>
      </div>

      <StockTable rows={rows} />
    </section>
  );
}
