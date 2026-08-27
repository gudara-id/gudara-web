'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError('Password salah.');
      return;
    }
    router.push('/admin/pesanan');
    router.refresh();
  }

  return (
    <section className="wrap" style={{ padding: '96px 0', maxWidth: 360 }}>
      <h1 style={{ marginBottom: 24 }}>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        {error && <p style={{ color: '#C6302B', fontSize: 13, marginTop: 8 }}>{error}</p>}
        <button className="btn btn--accent" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
      </form>
    </section>
  );
}
