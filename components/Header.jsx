'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function Header() {
  const { cartCount } = useCart();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="marquee">
        <div className="marquee__track">
          <span>GUDARA</span>
          <span>CUSTOM JERSEY</span>
          <span>MOVE FASTER</span>
          <span>DRY FIT PREMIUM</span>
          <span>GUDARA</span>
          <span>CUSTOM JERSEY</span>
          <span>MOVE FASTER</span>
          <span>DRY FIT PREMIUM</span>
        </div>
      </div>
      <header className="site" onMouseLeave={() => setMegaOpen(false)}>
        <div className="wrap nav-row">
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
          <nav className="nav-links">
            <div className="nav-item" onMouseEnter={() => setMegaOpen(true)}>
              <Link href="/etalase?kat=daily">Daily &amp; Casual</Link>
            </div>
            <Link href="/etalase?kat=sport" onMouseEnter={() => setMegaOpen(false)}>Sport Authentic</Link>
            <Link href="/custom" onMouseEnter={() => setMegaOpen(false)}>Custom Kits</Link>
            <Link href="/#tentang" onMouseEnter={() => setMegaOpen(false)}>Tentang Kami</Link>
          </nav>
          <div className="nav-actions">
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
          <Link href="/etalase?kat=daily" onClick={() => setMobileOpen(false)}>Daily &amp; Casual</Link>
          <Link href="/etalase?kat=sport" onClick={() => setMobileOpen(false)}>Sport Authentic</Link>
          <Link href="/custom" onClick={() => setMobileOpen(false)}>Custom Kits</Link>
          <Link href="/#tentang" onClick={() => setMobileOpen(false)}>Tentang Kami</Link>
          <Link href="/keranjang" onClick={() => setMobileOpen(false)}>Keranjang ({cartCount})</Link>
        </nav>
      </div>
    </>
  );
}
