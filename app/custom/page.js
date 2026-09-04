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
      {/* Banner ini sudah didesain lengkap (judul "CUSTOM KITS", tagline, dan
          bullet "FREE DESIGN / FULL CUSTOM / PREMIUM MATERIAL" sudah ada di
          dalam gambarnya sendiri) — makanya ditampilkan apa adanya, BUKAN
          lewat .hero/.hero__bg seperti section hero foto biasa (itu sengaja
          meredupkan foto ke opacity 0.55 + gradient gelap supaya judul HTML
          di atasnya kebaca; kalau dipakai di sini foto ini malah jadi kusam
          dan judulnya dobel dengan judul yang sudah ada di gambar). */}
      <section className="custom-hero-banner">
        <img
          src="/custom-kits-hero.jpg"
          alt="Custom Kits — Custom jersey dengan desain bebas, bahan nyaman, dan produksi berkualitas untuk kebutuhan tim, komunitas, maupun event."
        />
      </section>
 
      <section className="section--tight wrap" style={{ paddingTop: 40 }}>
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="breadcrumb__current">Custom Kits</span>
        </nav>
 
        <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', margin: '8px 0 24px' }}>Custom Kits</h1>

        <div className="order-steps">
          <div className="section-head" style={{ marginBottom: 24 }}>
            <div>
              <span className="eyebrow">Alur Pemesanan</span>
              <h2 style={{ fontSize: 'clamp(24px,3vw,34px)' }}>Cara Order Custom</h2>
            </div>
          </div>
          <div className="order-steps__grid">
            <div className="order-steps__item">
              <span className="order-steps__num">01</span>
              <h3 className="order-steps__title">Pilih Desain &amp; Bahan</h3>
              <p className="order-steps__desc">
                Pilih basic desain jersey di bawah, lalu cek Katalog Bahan di halaman produk untuk
                menentukan bahan yang kamu mau.
              </p>
            </div>
            <div className="order-steps__item">
              <span className="order-steps__num">02</span>
              <h3 className="order-steps__title">Konsultasi via WhatsApp</h3>
              <p className="order-steps__desc">
                Chat admin untuk detail warna, logo, nameset, dan jumlah pesanan — minimum order 12
                pcs per desain.
              </p>
            </div>
            <div className="order-steps__item">
              <span className="order-steps__num">03</span>
              <h3 className="order-steps__title">Approval Desain &amp; DP</h3>
              <p className="order-steps__desc">
                Admin kirim mockup desain untuk disetujui. Setelah fix, bayar DP untuk mulai proses
                produksi.
              </p>
            </div>
            <div className="order-steps__item">
              <span className="order-steps__num">04</span>
              <h3 className="order-steps__title">Produksi &amp; Pengiriman</h3>
              <p className="order-steps__desc">
                Jersey diproduksi sesuai desain, lalu dikirim ke alamatmu setelah pelunasan selesai.
              </p>
            </div>
          </div>
        </div>

        <div className="etalase-toolbar" style={{ marginTop: 48 }}>
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
            variant="custom"
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
