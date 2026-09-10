'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

function StockCell({ row }) {
  const [value, setValue] = useState(row.stock ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');

  if (row.variantId === null) {
    // Produk ini belum punya varian sama sekali — stok diatur setelah
    // menambahkan minimal satu varian di halaman produknya.
    return (
      <Link href={`/admin/produk/${row.productId}`} style={{ fontSize: 12 }}>
        Belum ada varian — atur di halaman produk
      </Link>
    );
  }

  async function save() {
    const stock = Number(value);
    if (!Number.isFinite(stock) || stock < 0) {
      setErr('Stok tidak valid');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const res = await fetch(`/api/admin/products/${row.productId}/variants/${row.variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: row.color, size: row.size, sku: row.sku, stock, price_override: null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || 'Gagal menyimpan');
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      setErr('Gagal menghubungi server');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => { if (Number(value) !== row.stock) save(); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
        style={{ width: 72, padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13, fontFamily: 'var(--body)' }}
      />
      {saving && <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Menyimpan...</span>}
      {saved && <span style={{ fontSize: 11, color: '#16A34A' }}>Tersimpan</span>}
      {err && <span style={{ fontSize: 11, color: '#C6302B' }}>{err}</span>}
    </div>
  );
}

export default function StockTable({ rows }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | low | out

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === 'low' && !(r.stock !== null && r.stock > 0 && r.stock <= 5)) return false;
      if (filter === 'out' && r.stock !== 0) return false;
      if (!q) return true;
      const hay = `${r.productName} ${r.color} ${r.size} ${r.sku}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, filter]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Cari nama produk, warna, ukuran, atau SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 260px', padding: '10px 12px', border: '1px solid var(--line)', fontSize: 13, fontFamily: 'var(--body)' }}
        />
        <div className="admin-tabs" style={{ marginBottom: 0 }}>
          <button type="button" className={`admin-tab${filter === 'all' ? ' is-active' : ''}`} onClick={() => setFilter('all')}>Semua</button>
          <button type="button" className={`admin-tab${filter === 'low' ? ' is-active' : ''}`} onClick={() => setFilter('low')}>Menipis</button>
          <button type="button" className={`admin-tab${filter === 'out' ? ' is-active' : ''}`} onClick={() => setFilter('out')}>Habis</button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Produk</th>
              <th>Warna</th>
              <th>Ukuran</th>
              <th>SKU</th>
              <th>Stok</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={`${r.productId}-${r.variantId || 'novar'}`}>
                <td>
                  {r.thumb ? <img src={r.thumb} alt="" className="admin-thumb" /> : <div className="admin-thumb" />}
                </td>
                <td>
                  <Link href={`/admin/produk/${r.productId}`}>{r.productName}</Link>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{r.category}</div>
                </td>
                <td>{r.color || '—'}</td>
                <td>{r.size || '—'}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{r.sku || '—'}</td>
                <td><StockCell row={r} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty">Tidak ada yang cocok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
