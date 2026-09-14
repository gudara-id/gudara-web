import Link from 'next/link';

export const metadata = {
  title: 'Panduan Ukuran | GUDARA',
  description: 'Cara mengukur badan dan tabel ukuran umum produk GUDARA (jersey, tee, jaket).',
};

const SIZE_ROWS = [
  { size: 'S', chest: '92–96', length: '66', sleeve: '20' },
  { size: 'M', chest: '97–101', length: '68', sleeve: '21' },
  { size: 'L', chest: '102–106', length: '70', sleeve: '22' },
  { size: 'XL', chest: '107–111', length: '72', sleeve: '23' },
  { size: 'XXL', chest: '112–117', length: '74', sleeve: '24' },
];

const HOW_TO_MEASURE = [
  {
    title: 'Lingkar Dada',
    body: 'Lingkarkan meteran di bagian dada terlebar (sekitar ketiak), sejajar lantai. Jangan ditarik terlalu ketat.',
  },
  {
    title: 'Panjang Badan',
    body: 'Ukur dari titik tertinggi bahu (dekat leher) lurus ke bawah sampai ujung bawah baju.',
  },
  {
    title: 'Panjang Lengan',
    body: 'Ukur dari ujung bahu sampai ujung lengan baju.',
  },
];

export default function PanduanUkuranPage() {
  return (
    <section className="section--tight wrap" style={{ paddingTop: 40, maxWidth: 860 }}>
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="breadcrumb__current">Panduan Ukuran</span>
      </nav>

      <h1 style={{ fontSize: 'clamp(32px,5vw,48px)', margin: '8px 0 16px' }}>Panduan Ukuran</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 640 }}>
        Tabel di bawah ini adalah acuan ukuran umum GUDARA dalam sentimeter (cm). Beberapa produk
        (mis. oversized, custom jersey) punya tabel ukurannya sendiri yang lebih akurat — cek
        bagian &quot;Panduan Ukuran&quot; di halaman produk yang bersangkutan sebelum memesan.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Cara Mengukur</h2>
      <div className="pdp-accordion" style={{ marginTop: 0, marginBottom: 40 }}>
        {HOW_TO_MEASURE.map((item) => (
          <div key={item.title} className="pdp-accordion__item">
            <div className="pdp-accordion__head" style={{ cursor: 'default' }}>
              <span>{item.title}</span>
            </div>
            <div className="pdp-accordion__body" style={{ display: 'block' }}>{item.body}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Tabel Ukuran Umum (cm)</h2>
      <div style={{ overflowX: 'auto', marginBottom: 40 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--ink)' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Size</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Lingkar Dada</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Panjang Badan</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Panjang Lengan</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_ROWS.map((row) => (
              <tr key={row.size} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{row.size}</td>
                <td style={{ padding: '10px 12px', color: 'var(--ink-soft)' }}>{row.chest} cm</td>
                <td style={{ padding: '10px 12px', color: 'var(--ink-soft)' }}>{row.length} cm</td>
                <td style={{ padding: '10px 12px', color: 'var(--ink-soft)' }}>{row.sleeve} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: 'var(--ink)', color: '#fff', padding: '32px 28px', borderRadius: 4 }}>
        <h2 style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>Masih ragu pilih ukuran?</h2>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          Kirim ukuran badanmu ke admin, kami bantu rekomendasikan size yang paling pas.
        </p>
        <a
          href="https://wa.me/628131648947?text=Halo%20Admin%20Gudara%2C%20saya%20mau%20tanya%20soal%20ukuran"
          className="btn btn--outline"
          style={{ borderColor: '#fff', color: '#fff' }}
        >
          Tanya via WhatsApp
        </a>
      </div>
    </section>
  );
}
