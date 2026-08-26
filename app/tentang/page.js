import Link from 'next/link';

export const metadata = {
  title: 'Tentang Kami | GUDARA',
  description: 'Cerita, misi, dan komitmen kualitas di balik brand sportswear GUDARA.',
};

const VALUES = [
  {
    title: 'Dry-Fit Performance',
    body: 'Material menyerap keringat dengan sirkulasi udara maksimal, dirancang untuk gerak bebas tanpa hambatan.',
  },
  {
    title: 'Kualitas Premium',
    body: 'Setiap jahitan dan detail diperiksa langsung sebelum sampai ke tanganmu — bukan sekadar jersey biasa.',
  },
  {
    title: 'Dibuat untuk Tim',
    body: 'Dari daily wear sampai custom kits tim, GUDARA hadir menemani setiap langkah, latihan, dan pertandingan.',
  },
];

export default function TentangPage() {
  return (
    <>
      {/* HERO */}
      <section style={{ background: 'var(--ink)', color: '#fff', padding: '72px 0 64px' }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.5)' }}>Tentang Kami</span>
          <h1 style={{ color: '#fff', fontSize: 'clamp(36px,6vw,64px)', margin: '12px 0 24px' }}>
            GUDARA.
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 17, lineHeight: 1.7 }}>
            GUDARA adalah brand sportswear asal Indonesia yang fokus pada jersey dan apparel
            dry-fit — dari koleksi daily &amp; casual, sport authentic, hingga custom kits untuk
            tim. Setiap produk dibuat dengan material yang menyerap keringat dan sirkulasi udara
            maksimal, cocok untuk aktivitas harian maupun olahraga.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="section section--tight">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Cerita Kami</span>
          <h2 style={{ margin: '8px 0 20px' }}>Dari Lapangan, Untuk Lapangan.</h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--ink-soft)', marginBottom: 16 }}>
            GUDARA lahir dari kecintaan pada olahraga dan kebutuhan akan apparel yang benar-benar
            bisa diajak bergerak. Kami percaya jersey yang baik bukan cuma soal desain, tapi soal
            bagaimana bahan itu terasa saat kamu berlari, latihan, atau sekadar nongkrong santai.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--ink-soft)' }}>
            Dari situ, GUDARA berkembang menjadi lebih dari sekadar brand pakaian — kami jadi
            partner buat tim-tim yang butuh custom jersey dengan kualitas premium, tanpa harus
            kompromi soal harga maupun waktu pengerjaan.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="section section--tight" style={{ background: 'var(--surface)' }}>
        <div className="wrap">
          <span className="eyebrow">Kenapa GUDARA</span>
          <h2 style={{ margin: '8px 0 32px' }}>Yang Kami Pegang Teguh.</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 24,
            }}
          >
            {VALUES.map((v) => (
              <div key={v.title} style={{ background: '#fff', padding: 28, border: '1px solid var(--line)' }}>
                <h3 style={{ fontSize: 20, marginBottom: 12 }}>{v.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-soft)' }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section--tight">
        <div className="wrap" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ marginBottom: 16 }}>Siap Elevasi Performamu?</h2>
          <p style={{ color: 'var(--ink-soft)', marginBottom: 28 }}>
            Jelajahi koleksi GUDARA atau mulai project custom jersey untuk timmu.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/etalase" className="btn btn--accent">Belanja Sekarang</Link>
            <Link href="/custom" className="btn btn--outline">Mulai Custom Jersey</Link>
          </div>
        </div>
      </section>
    </>
  );
}
