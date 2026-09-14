import Link from 'next/link';

export const metadata = {
  title: 'Pengembalian | GUDARA',
  description: 'Ketentuan pengembalian, penukaran ukuran, dan refund produk GUDARA.',
};

const CONDITIONS = [
  {
    title: 'Batas Waktu',
    body: 'Pengajuan pengembalian atau penukaran paling lambat 3×24 jam setelah paket diterima, dihitung dari status "Selesai" di Lacak Pesanan.',
  },
  {
    title: 'Syarat Barang',
    body: 'Produk belum dicuci, belum dipakai, tidak ada noda/bau, dan label/tag masih menempel lengkap dengan kemasan aslinya.',
  },
  {
    title: 'Alasan yang Diterima',
    body: 'Produk cacat produksi/rusak saat pengiriman, salah kirim (ukuran/warna/model berbeda dari pesanan), atau ingin tukar ukuran (selama stok tersedia).',
  },
  {
    title: 'Yang Tidak Bisa Dikembalikan',
    body: 'Produk custom/pre-order (dibuat sesuai pesanan tim/individu) dan produk diskon/clearance, kecuali terbukti cacat produksi.',
  },
  {
    title: 'Ongkos Kirim',
    body: 'Untuk kesalahan dari pihak GUDARA (cacat produksi/salah kirim), ongkir pengembalian ditanggung GUDARA. Untuk penukaran ukuran atas keinginan pembeli, ongkir kirim-balik ditanggung pembeli.',
  },
  {
    title: 'Metode Refund',
    body: 'Refund dikembalikan ke rekening/e-wallet yang sama dengan metode pembayaran, diproses maksimal 7 hari kerja setelah barang kami terima dan periksa.',
  },
];

export default function PengembalianPage() {
  return (
    <section className="section--tight wrap" style={{ paddingTop: 40, maxWidth: 780 }}>
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="breadcrumb__current">Pengembalian</span>
      </nav>

      <h1 style={{ fontSize: 'clamp(32px,5vw,48px)', margin: '8px 0 16px' }}>Pengembalian &amp; Penukaran</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 620 }}>
        Kami ingin kamu nyaman dengan setiap pembelian. Kalau ada yang tidak sesuai, berikut
        ketentuan dan cara pengajuannya.
      </p>

      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Ketentuan</h2>
      <div className="pdp-accordion" style={{ marginTop: 0, marginBottom: 40 }}>
        {CONDITIONS.map((item) => (
          <div key={item.title} className="pdp-accordion__item">
            <div className="pdp-accordion__head" style={{ cursor: 'default' }}>
              <span>{item.title}</span>
            </div>
            <div className="pdp-accordion__body" style={{ display: 'block' }}>{item.body}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Cara Mengajukan</h2>
      <ol style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.9, paddingLeft: 20, marginBottom: 40 }}>
        <li>Hubungi admin GUDARA via WhatsApp, sertakan nomor pesanan dan foto/video produk.</li>
        <li>Admin akan mengecek kelayakan pengembalian sesuai ketentuan di atas.</li>
        <li>Kalau disetujui, kamu akan diarahkan ke alamat pengiriman balik dan estimasi proses refund/penukaran.</li>
      </ol>

      <div style={{ background: 'var(--ink)', color: '#fff', padding: '32px 28px', borderRadius: 4 }}>
        <h2 style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>Mau ajukan pengembalian?</h2>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          Chat admin dengan nomor pesananmu, kami bantu prosesnya dari sana.
        </p>
        <a
          href="https://wa.me/628131648947?text=Halo%20Admin%20Gudara%2C%20saya%20mau%20ajukan%20pengembalian%2Fpenukaran%20untuk%20pesanan%20nomor%20..."
          className="btn btn--outline"
          style={{ borderColor: '#fff', color: '#fff' }}
        >
          Ajukan via WhatsApp
        </a>
      </div>
    </section>
  );
}
