import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import AdminNav from '@/components/AdminNav';
import PromoManager from '@/components/PromoManager';

export const dynamic = 'force-dynamic';

export default async function AdminPromoPage() {
  const supabase = getSupabaseAdmin();
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, category, description, material_spec, care_instructions, price, compare_price, is_active, product_images(url, sort_order)')
    .eq('is_active', true)
    .order('name', { ascending: true });

  const items = (products || []).map((p) => ({
    ...p,
    thumb: (p.product_images || []).slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url || null,
  }));

  const promoCount = items.filter((p) => p.compare_price && p.compare_price > p.price).length;

  return (
    <section className="wrap admin-shell">
      <AdminNav />
      <div className="admin-head">
        <div>
          <h1>Promo</h1>
          <p className="admin-head__meta">{promoCount} dari {items.length} produk aktif sedang promo</p>
        </div>
        <AdminLogoutButton />
      </div>

      {error && <p style={{ color: '#C6302B', marginBottom: 16 }}>Gagal memuat data: {error.message}</p>}

      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 24 }}>
        Isi "Harga Coret" untuk menandai produk sedang promo — otomatis muncul harga dicoret + badge diskon di halaman toko.
        Kosongkan untuk membatalkan promo. Bisa juga terapkan diskon % ke beberapa produk sekaligus di bawah.
      </p>

      <PromoManager products={items} />
    </section>
  );
}
