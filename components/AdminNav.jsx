'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin/pesanan', label: 'Pesanan' },
  { href: '/admin/produk', label: 'Produk' },
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
