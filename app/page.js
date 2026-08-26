export const dynamic = 'force-dynamic';
 
import Link from 'next/link';
import { getProductRow } from '@/lib/products';
import ProductGrid from '@/components/ProductGrid';
 
export default async function HomePage() {
  const [rowDaily, rowSport, rowBasic] = await Promise.all([
    getProductRow('daily', 4),
    getProductRow('sport', 4),
    getProductRow('basic', 2),
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
 
      {/* KATEGORI */}
      <section className="section" id="kategori">
        <div className="wrap section-head">
          <h2>Kategori Produk</h2>
        </div>
        <div className="cat-grid">
          <Link className="cat-card" href="/etalase?kat=daily">
            <img src="https://gudara.id/waffle-stripe-tee-black.jpg" alt="Daily & Casual" />
            <div className="cat-card__label"><h3>Daily &amp; Casual</h3><p>Nyaman untuk aktivitas harian</p></div>
          </Link>
          <Link className="cat-card" href="/etalase?kat=sport">
            <img src="https://gudara.id/army-running-black.jpg" alt="Sport Authentic" />
            <div className="cat-card__label"><h3>Sport Authentic</h3><p>Sirkulasi udara maksimal</p></div>
          </Link>
          <Link className="cat-card" href="/etalase?kat=basic">
            <img src="https://gudara.id/basic-tee-warna-hitam.jpg" alt="Basic" />
            <div className="cat-card__label"><h3>Basic</h3><p>Esensial, minimalis, premium</p></div>
          </Link>
        </div>
      </section>
 
      {/* DAILY */}
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
 
      {/* PROMO SPLIT: CUSTOM KITS */}
      <section className="promo">
        <div
          className="promo__media"
          style={{ backgroundImage: "url('https://gudara.id/costume gudara by penilaian toko shoope.jpg')" }}
        />
        <div className="promo__info">
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>Pride of the Nation</span>
          <h2>Custom Kits<br />Untuk Timmu</h2>
          <p>Koleksi custom Gudara hadir dengan beragam desain serta pemilihan bahan terbaik. Premium materials, authentic details.</p>
          <Link href="/custom" className="btn btn--accent" style={{ alignSelf: 'flex-start' }}>Mulai Project Custom</Link>
        </div>
      </section>
 
      {/* SPORT */}
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
 
