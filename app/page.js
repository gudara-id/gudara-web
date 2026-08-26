export const dynamic = 'force-dynamic';
 
import Link from 'next/link';
import { getProductRow } from '@/lib/products';
import ProductGrid from '@/components/ProductGrid';
 
export default async function HomePage() {
  // Flat catalog feed — no category param means all categories mixed together,
  // shown as a single dense grid right below the hero (reference-site pattern:
  // no "Kategori" intermediary, straight into the product wall).
  const [allProducts, rowDaily, rowSport, rowBasic] = await Promise.all([
    getProductRow(null, 24),
    getProductRow('daily', 4),
    getProductRow('sport', 4),
    getProductRow('basic', 4),
  ]);
 
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div
          className="hero__bg"
          style={{ backgroundImage: "url('/hero-1.jpg')" }}
        />
        <div className="wrap hero__content">
          <span className="eyebrow" style={{ color: '#fff' }}>Move Faster Collection</span>
          <h1>MOVE<br />FASTER.</h1>
          <p>Langkah lebih ringan, sirkulasi udara lebih bebas. Tingkatkan outfit-mu bersama GUDARA.</p>
          <div className="hero__ctas">
            <Link href="/etalase" className="btn btn--accent">Belanja Sekarang</Link>
            <Link href="/custom" className="btn btn--outline">Mulai Custom Jersey</Link>
          </div>
        </div>
      </section>
 
      {/* ALL PRODUCTS — flat, uncategorized, dense grid */}
      <section className="section section--tight">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Shop All</span>
              <h2>Semua Produk</h2>
            </div>
            <Link className="see-all" href="/etalase">Lihat Semua &rarr;</Link>
          </div>
          <ProductGrid products={allProducts} className="p-grid--dense" />
        </div>
      </section>
 
      {/* DAILY & CASUAL */}
      <section className="section section--tight">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Discover</span>
              <h2>Daily &amp; Casual</h2>
            </div>
            <Link className="see-all" href="/etalase?kat=daily">Lihat Semua &rarr;</Link>
          </div>
          <ProductGrid products={rowDaily} />
        </div>
      </section>
 
      {/* SPORT AUTHENTIC */}
      <section className="section section--tight">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Now Live</span>
              <h2>Sport Authentic</h2>
            </div>
            <Link className="see-all" href="/etalase?kat=sport">Lihat Semua &rarr;</Link>
          </div>
          <ProductGrid products={rowSport} />
        </div>
      </section>
 
      {/* BASIC */}
      <section className="section section--tight">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Elevated Basics</span>
              <h2>Basic</h2>
            </div>
            <Link className="see-all" href="/etalase?kat=basic">Lihat Semua &rarr;</Link>
          </div>
          <ProductGrid products={rowBasic} />
        </div>
      </section>
 
      {/* LOYALTY */}
      <section className="loyalty">
        <div className="wrap">
          <span className="eyebrow">Gudara Rewards</span>
          <h2>Gabung Komunitas Gudara, Gratis.</h2>
          <ul>
            <li>10% off pembelian pertama</li>
            <li>Kumpulkan poin tiap transaksi</li>
            <li>Akses diskon &amp; koleksi eksklusif</li>
          </ul>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a
              href="https://wa.me/628131648947?text=Halo%20Admin%20Gudara%2C%20saya%20mau%20tanya%20soal%20Gudara%20Rewards"
              className="btn btn--dark"
            >
              Daftar via WhatsApp
            </a>
          </div>
        </div>
      </section>
 
      {/* ABOUT */}
      <section className="section" id="tentang" style={{ background: 'var(--ink)', color: '#fff' }}>
        <div className="wrap" style={{ maxWidth: 720 }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.5)' }}>Tentang Kami</span>
          <h2 style={{ color: '#fff', marginBottom: 20 }}>GUDARA.</h2>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 16, lineHeight: 1.7 }}>
            GUDARA adalah brand sportswear asal Indonesia yang fokus pada jersey dan apparel
            dry-fit — dari koleksi daily &amp; casual, sport authentic, hingga custom kits untuk
            tim. Setiap produk dibuat dengan material yang menyerap keringat dan sirkulasi udara
            maksimal, cocok untuk aktivitas harian maupun olahraga.
          </p>
        </div>
      </section>
 
    </>
  );
}
 
