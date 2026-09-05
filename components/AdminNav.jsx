'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin/pesanan', label: 'Pesanan' },
  { href: '/admin/produk', label: 'Produk' },
  { href: '/admin/jurnal', label: 'Jurnal' },
  { href: '/admin/campaign', label: 'Campaign' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-section-nav">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={pathname?.startsWith(l.href) ? 'is-active' : ''}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
