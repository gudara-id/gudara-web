'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CategoryManager({ categories }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [newParentSlug, setNewParentSlug] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { text, ok }
  // Cuma kategori tanpa induk yang boleh jadi induk (tidak ada nested >2
  // level) — sesuai kebutuhan sekarang: "Sport Authentic" (induk) menaungi
  // "Badminton"/"Running"/"Sepak Bola" (anak).
  const parentOptions = categories.filter((c) => !c.parent_slug);
  const nameForSlug = (slug) => categories.find((c) => c.slug === slug)?.name || slug;

  function startEdit(cat) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setMsg(null);
  }

  async function saveEdit(id) {
    if (!editName.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: newName, parent_slug: newParentSlug || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewName('');
      setNewParentSlug('');
      setMsg({ text: `Kategori "${data.category.name}" ditambahkan.`, ok: true });
      router.refresh();
    } catch (err) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (err) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-card" style={{ marginBottom: 20 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', fontWeight: 600, fontSize: 14,
        }}
      >
        Kelola Kategori ({categories.length})
        <span>{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 16 }}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Slug</th>
                  <th>Induk</th>
                  <th>Jumlah Produk</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {editingId === c.id ? (
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ maxWidth: 220 }} />
                      ) : (
                        c.name
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)' }}>{c.slug}</td>
                    <td style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{c.parent_slug ? nameForSlug(c.parent_slug) : '—'}</td>
                    <td>{c.productCount}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {editingId === c.id ? (
                        <>
                          <button type="button" className="btn btn--dark" style={{ fontSize: 12, padding: '6px 12px' }} disabled={busy} onClick={() => saveEdit(c.id)}>
                            Simpan
                          </button>{' '}
                          <button type="button" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setEditingId(null)}>
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => startEdit(c)}>
                            Edit
                          </button>{' '}
                          <button
                            type="button"
                            style={{ fontSize: 12, padding: '6px 12px', color: c.productCount > 0 ? 'var(--ink-soft)' : '#C6302B' }}
                            disabled={c.productCount > 0 || busy}
                            title={c.productCount > 0 ? 'Pindahkan produk ke kategori lain dulu sebelum menghapus' : 'Hapus kategori'}
                            onClick={() => handleDelete(c)}
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginTop: 16, maxWidth: 560, flexWrap: 'wrap' }}>
            <input
              placeholder="Nama kategori baru (mis. Badminton)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ flex: 1, minWidth: 180 }}
            />
            <select
              value={newParentSlug}
              onChange={(e) => setNewParentSlug(e.target.value)}
              style={{ minWidth: 180 }}
            >
              <option value="">Tanpa induk (kategori utama)</option>
              {parentOptions.map((p) => (
                <option key={p.slug} value={p.slug}>Di bawah &quot;{p.name}&quot;</option>
              ))}
            </select>
            <button type="submit" className="btn btn--dark" style={{ fontSize: 13 }} disabled={busy}>
              + Tambah
            </button>
          </form>
          {newName.trim() && (
            <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>
              Slug: <code>{slugify(newName)}</code> — dipakai di URL etalase (?kat={slugify(newName)}) dan sebagai nilai kategori produk.
            </p>
          )}
          {msg && (
            <p style={{ fontSize: 13, marginTop: 10, color: msg.ok ? '#16A34A' : '#C6302B' }}>{msg.text}</p>
          )}
        </div>
      )}
    </div>
  );
}
