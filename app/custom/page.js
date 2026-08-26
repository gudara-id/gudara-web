export const metadata = { title: 'Custom Kits | GUDARA' };

export default function CustomPage() {
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

      <section className="section wrap">
        <div className="section-head"><h2>Pilih Paket</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          <div className="p-card" style={{ padding: 24 }}>
            <span className="eyebrow">Paket A</span>
            <h3 style={{ fontSize: 22, margin: '8px 0' }}>Printing Depan</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16 }}>
              Badan depan printing sublim, badan belakang &amp; tangan non-print.
            </p>
            <a
              href="https://wa.me/628131648947?text=Halo%20Admin%20Gudara%2C%20saya%20mau%20order%20Paket%20A"
              className="btn btn--dark"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Pesan Paket A
            </a>
          </div>
          <div className="p-card" style={{ padding: 24, border: '2px solid var(--accent)', position: 'relative' }}>
            <span
              style={{
                position: 'absolute', top: -12, left: 20, background: 'var(--accent)', color: '#fff',
                fontFamily: 'var(--mono)', fontSize: 11, padding: '4px 10px',
              }}
            >
              PALING POPULER
            </span>
            <span className="eyebrow">Paket C</span>
            <h3 style={{ fontSize: 22, margin: '8px 0' }}>Full Printing</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16 }}>
              Jersey full printing sublime — depan, belakang, dan kedua tangan.
            </p>
            <a
              href="https://wa.me/628131648947?text=Halo%20Admin%20Gudara%2C%20saya%20mau%20order%20Paket%20C"
              className="btn btn--accent"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Pesan Paket C
            </a>
          </div>
          <div className="p-card" style={{ padding: 24 }}>
            <span className="eyebrow">Paket B</span>
            <h3 style={{ fontSize: 22, margin: '8px 0' }}>Non Print Polos</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16 }}>
              Full polos dengan DTF logo, sponsor &amp; nameset — 3 titik DTF termasuk.
            </p>
            <a
              href="https://wa.me/628131648947?text=Halo%20Admin%20Gudara%2C%20saya%20mau%20order%20Paket%20B"
              className="btn btn--dark"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Pesan Paket B
            </a>
          </div>
        </div>

        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--ink-soft)' }}>
          Minimum order 12 pcs per desain. Konsultasikan kebutuhan custom-mu langsung ke admin untuk pemilihan bahan, font nameset, dan preview sebelum produksi.
        </p>
        <a
          href="https://wa.me/628131648947?text=Halo%20Admin%20Gudara%2C%20saya%20ingin%20custom"
          className="btn btn--dark"
          style={{ marginTop: 20 }}
        >
          Chat Admin untuk Konsultasi
        </a>
      </section>
    </>
  );
}
