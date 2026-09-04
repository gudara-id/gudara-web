'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { value: 'daily', label: 'Daily & Casual' },
  { value: 'sport', label: 'Sport Authentic' },
  { value: 'basic', label: 'Basic' },
  { value: 'custom', label: 'Custom Kits' },
];

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function ProductForm({ mode, product }) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(product?.category || 'daily');
  const [price, setPrice] = useState(product?.price ?? '');
  const [comparePrice, setComparePrice] = useState(product?.compare_price ?? '');
  const [description, setDescription] = useState(product?.description || '');
  const [materialSpec, setMaterialSpec] = useState(product?.material_spec || '');
  const [careInstructions, setCareInstructions] = useState(product?.care_instructions || '');
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(false);

  function handleNameChange(v) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const payload = {
      name,
      slug,
      category,
      price: Number(price),
      compare_price: comparePrice === '' ? null : Number(comparePrice),
      description,
      material_spec: materialSpec,
      care_instructions: careInstructions,
      is_active: isActive,
    };

    try {
      const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgOk(false);
        setMsg(data.error || 'Gagal menyimpan produk.');
        return;
      }
      if (isEdit) {
        setMsgOk(true);
        setMsg('Perubahan tersimpan.');
        router.refresh();
      } else {
        router.push(`/admin/produk/${data.id}`);
      }
    } catch {
      setMsgOk(false);
      setMsg('Gagal menghubungi server. Cek koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Hapus produk "${product.name}"? Foto dan varian yang menempel juga akan terhapus. Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgOk(false);
        setMsg(data.error || 'Gagal menghapus produk.');
        setDeleting(false);
        return;
      }
      router.push('/admin/produk');
      router.refresh();
    } catch {
      setMsgOk(false);
      setMsg('Gagal menghubungi server. Cek koneksi lalu coba lagi.');
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card">
      <div className="admin-form-grid">
        <div className="field">
          <label>Nama Produk</label>
          <input value={name} onChange={(e) => handleNameChange(e.target.value)} required />
        </div>
        <div className="field">
          <label>Slug (URL)</label>
          <input
            value={slug}
            onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
            required
          />
        </div>
        <div className="field">
          <label>Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="field field--checkbox" style={{ alignSelf: 'end', marginBottom: 16 }}>
          <input
            type="checkbox"
            id="is_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="is_active" style={{ textTransform: 'none', fontFamily: 'var(--body)', fontSize: 14, color: 'var(--ink)' }}>
            Aktif (tampil di toko)
          </label>
        </div>
        <div className="field">
          <label>Harga (Rp)</label>
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="field">
          <label>Harga Coret (opsional)</label>
          <input type="number" min="0" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} />
        </div>
        <div className="field field--full">
          <label>Deskripsi</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field field--full">
          <label>Spesifikasi Material</label>
          <textarea value={materialSpec} onChange={(e) => setMaterialSpec(e.target.value)} />
        </div>
        <div className="field field--full">
          <label>Petunjuk Perawatan</label>
          <textarea value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} />
        </div>
      </div>

      <div className="admin-actions" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--dark" disabled={loading}>
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Produk'}
          </button>
        </div>
        {isEdit && (
          <button
            type="button"
            className="btn btn--outline"
            style={{ color: '#C6302B', borderColor: '#C6302B' }}
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? 'Menghapus...' : 'Hapus Produk'}
          </button>
        )}
        {msg && <p className="admin-msg" style={{ color: msgOk ? '#16A34A' : '#C6302B' }}>{msg}</p>}
      </div>
    </form>
  );
}
