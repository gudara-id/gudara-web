import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ color: '#fff', marginBottom: 12 }}>GUDARA</div>
            <p style={{ fontSize: 13, maxWidth: 260, color: 'rgba(255,255,255,.6)' }}>
              Elevasi performa setiap langkah dengan jersey custom yang dirancang untuk kemenangan.
            </p>
          </div>
          <div>
            <h4>Belanja</h4>
            <Link href="/etalase?kat=daily">Daily &amp; Casual</Link>
            <Link href="/etalase?kat=sport">Sport Authentic</Link>
            <Link href="/etalase?kat=basic">Basic</Link>
            <Link href="/custom">Custom Kits</Link>
          </div>
          <div>
            <h4>Bantuan</h4>
            <a href="#">Lacak Pesanan</a>
            <a href="#">Pengembalian</a>
            <a href="#">Panduan Ukuran</a>
            <a href="https://wa.me/628131648947">Hubungi Kami</a>
          </div>
          <div>
            <h4>Perusahaan</h4>
            <Link href="/tentang">Tentang Kami</Link>
            <Link href="/jurnal">Jurnal</Link>
            <a href="#">Karier</a>
            <a href="#">Ulasan</a>
          </div>
          <div>
            <h4>Ikuti Kami</h4>
            <a href="https://www.instagram.com/gudaraaa.id/">Instagram</a>
            <a href="https://www.tiktok.com/@gudaraaa">TikTok</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 GUDARA Apparel. All Rights Reserved.</span>
          <span>Dibuat di Indonesia 🇮🇩</span>
        </div>
      </div>
    </footer>
  );
}
