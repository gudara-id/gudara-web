'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      className="btn"
      onClick={handleLogout}
      disabled={loading}
      style={{ fontSize: 13, padding: '6px 14px' }}
    >
      {loading ? 'Keluar...' : 'Keluar'}
    </button>
  );
}
