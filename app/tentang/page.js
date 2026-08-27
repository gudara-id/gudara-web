import Link from 'next/link';

export const metadata = {
  title: 'Tentang Kami | GUDARA',
  description: 'Cerita, misi, dan komitmen kualitas di balik brand sportswear GUDARA.',
};

const TIMELINE = [
  {
    year: '5 MEI 2025',
    title: 'Lahirnya Gudara',
    body: 'GUDARA lahir dari kecintaan pada olahraga dan kebutuhan Outfit Harian yang benar-benar bisa diajak bergerak. Kami percaya jersey yang baik bukan cuma soal desain, tapi soal bagaimana bahan itu terasa saat kamu berlari, latihan, atau sekadar nongkrong santai.',
    image: 'https://iczlakzbvolwwujnyccr.supabase.co/storage/v1/object/public/products/tentang-kami/gudara1.png'
  },
  {
    year: 'Pertumbuhan',
    title: 'Mendapat Perhatian',
    body: 'Dari kecintaan tersebut, GUDARA berkembang menjadi lebih dari sekadar brand pakaian — kami mulai menjadi partner andalan buat tim-tim yang butuh custom jersey dengan kualitas premium, tanpa harus khawatir.',
    image: 'https://iczlakzbvolwwujnyccr.supabase.co/storage/v1/object/public/products/tentang-kami/event.jpg'
  },
  {
    year: 'Inovasi',
    title: 'Performa Dry-Fit', 
    body: 'Fokus kami beralih pada riset material. Menghadirkan kain yang mampu menyerap keringat secara optimal dengan sirkulasi udara maksimal. Dirancang khusus untuk memberikan kebebasan gerak tanpa hambatan, memastikan setiap pemakai tetap merasa sejuk.',
    image: 'https://iczlakzbvolwwujnyccr.supabase.co/storage/v1/object/public/products/tentang-kami/inovasi.jpg'
  },
  {
    year: '16 AGUSTUS 2026',
    title: 'SWARUN - FUN RUN 5K',
    body: '"Setiap Langkah penuh cerita" Swarun 5K Fun Run bareng Gudara di taman kopo katapang',
    image: 'https://iczlakzbvolwwujnyccr.supabase.co/storage/v1/object/public/products/tentang-kami/6089228066623265184.jpg'
  },
  {
    year: '21 AGUSTUS 2026',
    title: 'TWO TRIPLE O X GUDARA.',
    body: '"When music meets movement." Official look dari kolaborasi Gudara bersama Two Triple O. Teman setia buat all-out di atas panggung maupun di bawah panggung.',
    image: 'https://iczlakzbvolwwujnyccr.supabase.co/storage/v1/object/public/products/tentang-kami/two-triple-o.png'
  },
];

export default function TentangPage() {
  return (
    <>
      {/* HERO SECTION WITH BACKGROUND VIDEO */}
      <section style={{ 
        position: 'relative', 
        height: '80vh', 
        minHeight: '600px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#fff',
        textAlign: 'center',
        overflow: 'hidden',
        background: 'var(--ink)'
      }}>
        
        {/* Video Background dari Supabase */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        >
          {/* URL Public dari Supabase yang sudah Anda masukkan */}
          <source src="https://zjifplqvpkmuiprmidwn.supabase.co/storage/v1/object/sign/MEDIA%20GUDARA/TENTANG%20KAMI/TikTok_HD_e4ba7fe7.mp4?token=eyJraWQiOiJiMzk4OTU3NC00Zjk0LTQ5ZjEtOTE5My1mYmQzMWU5NmYxMTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJNRURJQSBHVURBUkEvVEVOVEFORyBLQU1JL1Rpa1Rva19IRF9lNGJhN2ZlNy5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg3ODA2NDcyLCJleHAiOjE4MTkzNDI0NzJ9.MMGp3l3G3E_U3CyhddLf4XtcaSKyduNDLfnnHOImui6N8rKmKl3MQpzOiHIl0bh25YA4wqA7xK4M0FmU3qUGFQ" type="video/mp4" />
        </video>
      </section>

      {/* INTRO TEXT UNDER HERO */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--bg)' }}>
        <p style={{ 
          maxWidth: '700px', 
          margin: '0 auto', 
          fontSize: '18px', 
          lineHeight: '1.8', 
          color: 'var(--ink)' 
        }}>
          GUDARA adalah brand sportswear asal Indonesia yang berakar pada performa dan gaya. 
          Setiap produk menceritakan perjalanan kami mengejar kesempurnaan. Dari lapangan, untuk lapangan.
        </p>
      </section>

      {/* ALTERNATING TIMELINE SECTION (REPRESENT STYLE) */}
      <section style={{ background: 'var(--bg)', paddingBottom: '120px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', padding: '0 24px' }}>
          
          {/* Center Vertical Line (Hidden on mobile) */}
          <div className="desktop-only-line" style={{
            position: 'absolute',
            left: '50%',
            top: '0',
            bottom: '0',
            width: '1px',
            backgroundColor: '#e2e2e2',
            transform: 'translateX(-50%)',
            zIndex: 1
          }} />

          {TIMELINE.map((item, index) => {
            const isEven = index % 2 === 0; 
            
            return (
              <div 
                key={item.year} 
                className={`timeline-row ${isEven ? 'row-even' : 'row-odd'}`}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '100px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {/* 
                  Center Dot 
                */}
                <div className="center-dot" style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '6px',
                  height: '6px',
                  backgroundColor: 'var(--ink)',
                  borderRadius: '50%',
                  zIndex: 3
                }} />

                {/* LEFT COLUMN */}
                <div className="col-left" style={{ 
                  flex: 1, 
                  paddingRight: '60px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  textAlign: 'right'
                }}>
                  {isEven ? (
                    // Photo on Left
                    <img src={item.image} alt={item.title} style={{ 
                      width: '100%', 
                      maxWidth: '450px',
                      height: 'auto',
                      display: 'block'
                    }} />
                  ) : (
                    // Text on Left
                    <div style={{ maxWidth: '400px' }}>
                      <div style={{ fontSize: '18px', color: 'var(--ink-soft)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        {item.year}
                      </div>
                      <h3 style={{ fontSize: '28px', marginBottom: '16px', lineHeight: 1.1 }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--ink-soft)' }}>
                        {item.body}
                      </p>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-right" style={{ 
                  flex: 1, 
                  paddingLeft: '60px',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  textAlign: 'left'
                }}>
                  {isEven ? (
                    // Text on Right
                    <div style={{ maxWidth: '400px' }}>
                      <div style={{ fontSize: '18px', color: 'var(--ink-soft)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        {item.year}
                      </div>
                      <h3 style={{ fontSize: '28px', marginBottom: '16px', lineHeight: 1.1 }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--ink-soft)' }}>
                        {item.body}
                      </p>
                    </div>
                  ) : (
                    // Photo on Right
                    <img src={item.image} alt={item.title} style={{ 
                      width: '100%', 
                      maxWidth: '450px',
                      height: 'auto',
                      display: 'block'
                    }} />
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section section--tight" style={{ background: 'var(--ink)', color: '#fff' }}>
        <div className="wrap" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ marginBottom: 24, fontSize: 'clamp(32px, 5vw, 48px)' }}>Mulai Cerita Baru.</h2>
          <p style={{ color: 'rgba(255,255,255,.7)', marginBottom: 32, fontSize: 16, lineHeight: 1.7 }}>
            Jelajahi koleksi terbaru GUDARA atau mulai project custom jersey untuk membawa timmu ke level berikutnya.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/etalase" className="btn btn--accent" style={{ background: '#fff', color: 'var(--ink)' }}>
              Belanja Sekarang
            </Link>
            <Link href="/custom" className="btn btn--outline" style={{ borderColor: 'rgba(255,255,255,.3)', color: '#fff' }}>
              Mulai Custom Jersey
            </Link>
          </div>
        </div>
      </section>

      {/* CSS For Mobile Responsiveness */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 767px) {
          .desktop-only-line { display: none !important; }
          .center-dot { display: none !important; }
          
          .timeline-row {
            flex-direction: column !important;
            margin-bottom: 60px !important;
          }
          
          /* Force Photo on top, text on bottom for mobile regardless of even/odd */
          .row-even .col-left { order: 1; padding: 0 !important; margin-bottom: 24px; justify-content: center !important; width: 100%; }
          .row-even .col-right { order: 2; padding: 0 !important; text-align: center !important; justify-content: center !important; width: 100%; }
          
          .row-odd .col-left { order: 2; padding: 0 !important; text-align: center !important; justify-content: center !important; width: 100%; }
          .row-odd .col-right { order: 1; padding: 0 !important; margin-bottom: 24px; justify-content: center !important; width: 100%; }
        }
      `}} />
    </>
  );
}
