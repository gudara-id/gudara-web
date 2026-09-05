export const dynamic = 'force-dynamic';
 
import Link from 'next/link';
import { getProductRow } from '@/lib/products';
import { getJournalPosts } from '@/lib/journal';
import { getActiveHero } from '@/lib/hero';
import ProductGrid from '@/components/ProductGrid';
import JournalCard from '@/components/JournalCard';
 
export default async function HomePage() {
  // Flat catalog feed — no category param means all categories mixed together,
  // shown as a single dense grid right below the hero (reference-site pattern:
  // no "Kategori" intermediary, straight into the product wall).
  const [allProducts, rowDaily, rowSport, rowBasic, journalPosts, hero] = await Promise.all([
    getProductRow(null, 24, 'newest', '', { excludeCustom: true }),
    getProductRow('daily', 4),
    getProductRow('sport', 4),
    getProductRow('basic', 4),
    getJournalPosts(null, 3),
    getActiveHero(),
  ]);
 
  return (
    <>
      {/* HERO — foto & teks diatur dari /admin/campaign, lihat lib/hero.js */}
      <section className="hero">
        <div
          className="hero__bg"
          style={{ backgroundImage: `url('${hero.image}')` }}
        />
        <div className="wrap hero__content">
          {hero.eyebrow && <span className="eyebrow" style={{ color: '#fff' }}>{hero.eyebrow}</span>}
          <h1>
            {hero.headline.split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
          {hero.description && <p>{hero.description}</p>}
          <div className="hero__ctas">
            {hero.ctaPrimaryLabel && hero.ctaPrimaryHref && (
              <Link href={hero.ctaPrimaryHref} className="btn btn--accent">{hero.ctaPrimaryLabel}</Link>
            )}
            {hero.ctaSecondaryLabel && hero.ctaSecondaryHref && (
              <Link href={hero.ctaSecondaryHref} className="btn btn--outline">{hero.ctaSecondaryLabel}</Link>
            )}
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
 
      {/* JURNAL — berita, event, portofolio */}
      {journalPosts.length > 0 && (
        <section className="section section--tight">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Jurnal</span>
                <h2>Berita &amp; Cerita Kami</h2>
              </div>
              <Link className="see-all" href="/jurnal">Lihat Semua &rarr;</Link>
            </div>
            <div className="journal-grid">
              {journalPosts.map((post) => (
                <JournalCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
 
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
 
      {/* ABOUT (teaser — halaman lengkap di /tentang) */}
      <section className="section" style={{ background: 'var(--ink)', color: '#fff' }}>
        <div className="wrap" style={{ maxWidth: 720 }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.5)' }}>Tentang Kami</span>
          <h2 style={{ color: '#fff', marginBottom: 20 }}>GUDARA.</h2>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
            GUDARA adalah brand sportswear asal Indonesia yang fokus pada jersey dan apparel
            dry-fit — dari koleksi daily &amp; casual, sport authentic, hingga custom kits untuk
            tim, dibuat dengan material yang menyerap keringat dan sirkulasi udara maksimal.
          </p>
          <Link href="/tentang" className="btn btn--outline" style={{ borderColor: '#fff', color: '#fff' }}>
            Selengkapnya &rarr;
          </Link>
        </div>
      </section>
 
    </>
  );
}
