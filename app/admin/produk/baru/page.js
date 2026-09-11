import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import ProductWizard from '@/components/ProductWizard';

export const dynamic = 'force-dynamic';

export default async function AdminNewProductPage() {
  const supabase = getSupabaseAdmin();
  const { data: categories } = await supabase
    .from('product_categories')
    .select('slug, name')
    .order('sort_order', { ascending: true });

  return (
    <section className="wrap admin-shell admin-shell--narrow">
      <Link href="/admin/produk" className="admin-back">&larr; Kembali ke Produk</Link>

      <div className="admin-head">
        <div>
          <h1>Tambah Produk</h1>
          <p className="admin-head__meta">Isi info, foto, lalu varian &amp; stok — semuanya di halaman ini, mirip alur upload di marketplace.</p>
        </div>
      </div>

      <ProductWizard categories={categories || []} />
    </section>
  );
}
