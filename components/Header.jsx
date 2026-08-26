'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

const MARQUEE_ITEMS = ['GUDARA', 'CUSTOM JERSEY', 'MOVE FASTER', 'DRY FIT PREMIUM'];
// Diulang banyak kali (bukan cuma 2x) supaya total lebar track selalu lebih
// besar dari lebar layar manapun (termasuk monitor lebar) — kalau tidak,
// bagian setelah teks habis akan terlihat kosong sebelum animasi mengulang.
const MARQUEE_REPEAT = 8;

export default function Header() {
  const { cartCount } = useCart();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="marquee">
        <div className="marquee__track">
          {Array.from({ length: MARQUEE_REPEAT }).map((_, rep) =>
            MARQUEE_ITEMS.map((item, i) => (
              <span key={`${rep}-${i}`}>{item}</span>
            ))
          )}
        </div>
      </div>
      <header className="site" onMouseLeave={() => setMegaOpen(false)}>
        <div className="wrap nav-row">
          <div className="nav-left">
            <button
              className="menu-btn"
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
            <Link href="/" className="logo">GUDARA</Link>
          </div>
          <nav className="nav-links">
            <div className="nav-item" onMouseEnter={() => setMegaOpen(true)}>
              <Link href="/etalase">Shop</Link>
            </div>
            <Link href="/custom" onMouseEnter={() => setMegaOpen(false)}>Custom Kits</Link>
            <Link href="/tentang" onMouseEnter={() => setMegaOpen(false)}>Tentang Kami</Link>
          </nav>
          <div className="nav-actions">
            <Link className="icon-btn" href="/etalase" aria-label="Cari produk">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
            <Link className="icon-btn" href="/keranjang">
              Keranjang <span className="cart-count">{cartCount}</span>
            </Link>
          </div>
        </div>

        <div className={`mega${megaOpen ? ' mega--open' : ''}`}>
          <div className="wrap mega-grid">
            <div className="mega-col">
              <h4>Daily &amp; Casual</h4>
              <Link href="/etalase?kat=daily">Semua Daily &amp; Casual</Link>
              <Link href="/etalase?kat=daily">Jersey Fantasy</Link>
              <Link href="/etalase?kat=daily">Oversized</Link>
              <Link href="/etalase?kat=daily">Kerah Rib</Link>
            </div>
            <div className="mega-col">
              <h4>Sport Authentic</h4>
              <Link href="/etalase?kat=sport">Semua Sport Authentic</Link>
              <Link href="/etalase?kat=sport">Army Series</Link>
              <Link href="/etalase?kat=sport">Terrain Series</Link>
              <Link href="/etalase?kat=sport">Vortex Series</Link>
            </div>
            <div className="mega-col">
              <h4>Basic</h4>
              <Link href="/etalase?kat=basic">Basic Tee Man</Link>
              <Link href="/etalase?kat=basic">Basic Tee Woman</Link>
            </div>
            <div className="mega-col">
              <h4>Sorotan</h4>
              <Link href="/etalase">New Arrivals</Link>
              <Link href="/etalase">Bestsellers</Link>
              <Link href="/custom">Custom Kits</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <div className={`overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />
      <div className={`mobile-drawer${mobileOpen ? ' open' : ''}`}>
        <div className="mobile-drawer__head">
          <span className="logo">GUDARA</span>
          <button aria-label="Tutup menu" onClick={() => setMobileOpen(false)}>&times;</button>
        </div>
        <nav className="mobile-drawer__links">
          <Link href="/etalase" onClick={() => setMobileOpen(false)}>Shop</Link>
          <Link href="/custom" onClick={() => setMobileOpen(false)}>Custom Kits</Link>
          <Link href="/tentang" onClick={() => setMobileOpen(false)}>Tentang Kami</Link>
          <Link href="/keranjang" onClick={() => setMobileOpen(false)}>Keranjang ({cartCount})</Link>
        </nav>
      </div>
    </>
  );
}
