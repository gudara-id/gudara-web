'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRp, titleCase } from '@/lib/format';

export default function AdminProductsTable({ products, categoryNameMap, categories }) {
  const router = useRouter();
  const [selected, setSelected] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [bulkCategory, setBulkCategory] = useState('');

  const allIds = useMemo(() => products.map((p) => p.id), [products]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0 && !allSelected;

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function clearSelection() {
    setSelected(new Set());
    setBulkCategory('');
  }

  async function runBulk(action, extra = {}) {
    const ids = Array.from(selected);
    if (!ids.length) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || 'Gagal memproses aksi massal.');
        return;
      }
      clearSelection();
      router.refresh();
    } catch {
      setMsg('Gagal menghubungi server. Cek koneksi lalu coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  function handleBulkDelete() {
    const count = selected.size;
    if (!count) return;
    if (
      !confirm(
        `Hapus ${count} produk terpilih? Foto dan varian yang menempel juga akan terhapus. Tindakan ini tidak bisa dibatalkan.`
      )
    ) {
      return;
    }
    runBulk('delete');
  }

  function handleBulkCategory() {
    if (!bulkCategory) return;
    runBulk('set_category', { category: bulkCategory });
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="admin-bulkbar">
          <span className="admin-bulkbar__count">{selected.size} produk dipilih</span>
          <div className="admin-bulkbar__actions">
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: 12, padding: '6px 12px', color: 'var(--ink)', borderColor: 'var(--ink)' }}
              disabled={busy}
              onClick={() => runBulk('set_active', { is_active: true })}
            >
              Aktifkan
            </button>
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: 12, padding: '6px 12px', color: 'var(--ink)', borderColor: 'var(--ink)' }}
              disabled={busy}
              onClick={() => runBulk('set_active', { is_active: false })}
            >
              Nonaktifkan
            </button>
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              disabled={busy}
              style={{ fontSize: 12, padding: '8px 10px' }}
            >
              <option value="">Pindah kategori...</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: 12, padding: '6px 12px', color: 'var(--ink)', borderColor: 'var(--ink)' }}
              disabled={busy || !bulkCategory}
              onClick={handleBulkCategory}
            >
              Terapkan
            </button>
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: 12, padding: '6px 12px', color: '#C6302B', borderColor: '#C6302B' }}
              disabled={busy}
              onClick={handleBulkDelete}
            >
              {busy ? 'Memproses...' : 'Hapus Terpilih'}
            </button>
            <button
              type="button"
              style={{ fontSize: 12, padding: '6px 12px', color: 'var(--ink-soft)' }}
              disabled={busy}
              onClick={clearSelection}
            >
              Batal pilih
            </button>
          </div>
        </div>
      )}

      {msg && <p className="admin-msg" style={{ color: '#C6302B' }}>{msg}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table__checkcol">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  aria-label="Pilih semua produk"
                />
              </th>
              <th>Foto</th>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={selected.has(p.id) ? 'is-selected' : ''}>
                <td className="admin-table__checkcol">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    aria-label={`Pilih ${p.name}`}
                  />
                </td>
                <td>
                  {p.thumb ? (
                    <img src={p.thumb} alt="" className="admin-thumb" />
                  ) : (
                    <div className="admin-thumb" />
                  )}
                </td>
                <td>
                  <Link href={`/admin/produk/${p.id}`}>{p.name}</Link>
                </td>
                <td>{categoryNameMap[p.category] || titleCase(p.category)}</td>
                <td>{formatRp(p.price)}</td>
                <td>{p.totalStock}</td>
                <td>
                  <span className="admin-status">
                    <span className="admin-status__dot" style={{ background: p.is_active ? '#16A34A' : '#9CA3AF' }} />
                    {p.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-empty">
                  Belum ada produk pada kategori ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
