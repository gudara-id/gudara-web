import Link from 'next/link';
import ProductWizard from '@/components/ProductWizard';

export default function AdminNewProductPage() {
  return (
    <section className="wrap admin-shell admin-shell--narrow">
      <Link href="/admin/produk" className="admin-back">&larr; Kembali ke Produk</Link>

      <div className="admin-head">
        <div>
          <h1>Tambah Produk</h1>
          <p className="admin-head__meta">Isi info, foto, lalu varian &amp; stok — semuanya di halaman ini, mirip alur upload di marketplace.</p>
        </div>
      </div>

      <ProductWizard />
    </section>
  );
}
