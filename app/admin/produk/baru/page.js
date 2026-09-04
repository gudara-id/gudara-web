import Link from 'next/link';
import ProductForm from '@/components/ProductForm';

export default function AdminNewProductPage() {
  return (
    <section className="wrap admin-shell admin-shell--narrow">
      <Link href="/admin/produk" className="admin-back">&larr; Kembali ke Produk</Link>

      <div className="admin-head">
        <div>
          <h1>Tambah Produk</h1>
          <p className="admin-head__meta">Foto dan varian bisa ditambahkan setelah produk dibuat.</p>
        </div>
      </div>

      <ProductForm mode="create" />
    </section>
  );
}
