export const dynamic = 'force-dynamic';
 
import Link from 'next/link';
import { getProductRow } from '@/lib/products';
import ProductGrid from '@/components/ProductGrid';
 
export const metadata = { title: 'Custom Kits | GUDARA' };
 
export default async function CustomPage() {
  // Produk yang bisa di-custom pelanggan (jersey, kaos tim, dll) — sama
  // seperti kategori lain, tinggal tambahkan produk dengan category:'custom'
  // di Supabase dan otomatis muncul di sini, tampilannya konsisten dengan Shop.
  const products = await getProductRow('custom', 24);
 
  return (
    <>
      <section className="hero" style={{ minHeight: '50vh' }}>
        <div
          className="hero__bg"
          style={{ backgroundImage: "url('https://gudara.id/costume gudara by penilaian toko shoope.jpg')" }}
        />
        <div className="wrap hero__content">
          <span className="eyebrow" style={{ color: '#fff' }}>Pride of the Nation</span>
          <h1 style={{ fontSize: 'clamp(40px,8vw,90px)' }}>CUSTOM<br />KITS</h1>
          <p>Jersey tim dengan desainmu sendiri. Premium materials, authentic details.</p>
        </div>
      </section>
 
      <section className="section--tight wrap" style={{ paddingTop: 40 }}>
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="breadcrumb__current">Custom Kits</span>
        </nav>
 
        <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', margin: '8px 0 24px' }}>Custom Kits</h1>
 
        <div className="etalase-toolbar">
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 560 }}>
            Pilih dasar desain di bawah lalu sesuaikan warna, printing, dan nameset bersama admin.
            Minimum order 12 pcs per desain.
          </p>
          <div className="etalase-toolbar__actions">
            <span className="etalase-count">{products.length} desain</span>
          </div>
        </div>
 
        <div style={{ marginBottom: 48 }}>
          <ProductGrid
            products={products}
            emptyLabel="Produk custom sedang disiapkan — chat admin untuk konsultasi desain sementara ini."
          />
        </div>
 
        <a
          href="https://wa.me/628131648947?text=Halo%20Admin%20Gudara%2C%20saya%20ingin%20custom"
          className="btn btn--dark"
        >
          Chat Admin untuk Konsultasi
        </a>
      </section>
    </>
  );
}
