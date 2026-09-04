'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatRp } from '@/lib/format';

function VariantRow({ productId, variant, onSaved }) {
  const router = useRouter();
  const [color, setColor] = useState(variant.color || '');
  const [size, setSize] = useState(variant.size || '');
  const [sku, setSku] = useState(variant.sku || '');
  const [stock, setStock] = useState(variant.stock ?? 0);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [err, setErr] = useState('');

  async function save() {
    setSaving(true);
    setErr('');
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants/${variant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color, size, sku, stock: Number(stock), price_override: variant.price_override }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || 'Gagal menyimpan.'); return; }
      router.refresh();
    } catch {
      setErr('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('Hapus varian ini?')) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants/${variant.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || 'Gagal menghapus.'); setRemoving(false); return; }
      router.refresh();
    } catch {
      setErr('Gagal menghubungi server.');
      setRemoving(false);
    }
  }

  return (
    <div>
      <div className="admin-variant-row">
        <input placeholder="Warna" value={color} onChange={(e) => setColor(e.target.value)} />
        <input placeholder="Ukuran" value={size} onChange={(e) => setSize(e.target.value)} />
        <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
        <input type="number" min="0" placeholder="Stok" value={stock} onChange={(e) => setStock(e.target.value)} />
        <button type="button" className="btn btn--outline" style={{ padding: '8px', color: '#C6302B', borderColor: '#C6302B' }} disabled={removing} onClick={remove}>
          ×
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
        <button type="button" className="btn btn--outline" style={{ fontSize: 12, padding: '6px 12px', color: 'var(--ink)', borderColor: 'var(--ink)' }} disabled={saving} onClick={save}>
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        {err && <span style={{ fontSize: 12, color: '#C6302B' }}>{err}</span>}
      </div>
    </div>
  );
}

export default function ProductVariants({ productId, variants, basePrice }) {
  const router = useRouter();
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState(0);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState('');

  async function addVariant(e) {
    e.preventDefault();
    setAdding(true);
    setErr('');
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color, size, sku, stock: Number(stock) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || 'Gagal menambah varian.'); return; }
      setColor(''); setSize(''); setSku(''); setStock(0);
      router.refresh();
    } catch {
      setErr('Gagal menghubungi server.');
    } finally {
      setAdding(false);
    }
  }

  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  return (
    <div className="admin-card">
      <div className="admin-section-label" style={{ marginTop: 0 }}>
        Varian (Warna / Ukuran / Stok) — Total stok: {totalStock}
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>
        Harga dasar produk: {formatRp(basePrice)}. Kosongkan field yang tidak relevan.
      </p>

      {variants.length === 0 && <p className="admin-image-empty" style={{ marginBottom: 16 }}>Belum ada varian.</p>}
      {variants.map((v) => (
        <VariantRow key={v.id} productId={productId} variant={v} />
      ))}

      <div className="admin-section-label">Tambah Varian</div>
      <form onSubmit={addVariant} className="admin-variant-row">
        <input placeholder="Warna" value={color} onChange={(e) => setColor(e.target.value)} />
        <input placeholder="Ukuran" value={size} onChange={(e) => setSize(e.target.value)} />
        <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
        <input type="number" min="0" placeholder="Stok" value={stock} onChange={(e) => setStock(e.target.value)} />
        <button className="btn btn--dark" style={{ padding: '8px' }} disabled={adding}>+</button>
      </form>
      {err && <p className="admin-msg" style={{ color: '#C6302B' }}>{err}</p>}
    </div>
  );
}
