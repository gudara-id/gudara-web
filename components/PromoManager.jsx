'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatRp } from '@/lib/format';

function discountPercent(price, comparePrice) {
  if (!comparePrice || comparePrice <= price) return null;
  return Math.round((1 - price / comparePrice) * 100);
}

async function saveProduct(product, comparePrice) {
  const payload = {
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    compare_price: comparePrice === '' || comparePrice == null ? null : Number(comparePrice),
    description: product.description,
    material_spec: product.material_spec,
    care_instructions: product.care_instructions,
    is_active: product.is_active,
  };
  const res = await fetch(`/api/admin/products/${product.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal menyimpan.');
}

function PromoRow({ product, selected, onToggleSelect }) {
  const router = useRouter();
  const [comparePrice, setComparePrice] = useState(product.compare_price ?? '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(false);

  const off = discountPercent(product.price, comparePrice === '' ? null : Number(comparePrice));

  async function save() {
    setSaving(true);
    setMsg('');
    try {
      await saveProduct(product, comparePrice);
      setMsgOk(true);
      setMsg('Tersimpan.');
      router.refresh();
    } catch (e) {
      setMsgOk(false);
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td>
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(product.id)} />
      </td>
      <td>
        {product.thumb ? <img src={product.thumb} alt="" className="admin-thumb" /> : <div className="admin-thumb" />}
      </td>
      <td>{product.name}</td>
      <td>{formatRp(product.price)}</td>
      <td>
        <input
          type="number"
          min="0"
          placeholder="—"
          value={comparePrice}
          onChange={(e) => setComparePrice(e.target.value)}
          style={{ width: 110, padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13, fontFamily: 'var(--body)' }}
        />
      </td>
      <td>
        {off != null ? (
          <span className="admin-promo-badge">-{off}%</span>
        ) : (
          <span style={{ color: 'var(--ink-soft)', fontSize: 12 }}>Tidak promo</span>
        )}
      </td>
      <td>
        <button type="button" className="btn btn--outline" style={{ fontSize: 12, padding: '6px 12px', color: 'var(--ink)', borderColor: 'var(--ink)' }} disabled={saving} onClick={save}>
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        {msg && <div style={{ fontSize: 11, color: msgOk ? '#16A34A' : '#C6302B', marginTop: 4 }}>{msg}</div>}
      </td>
    </tr>
  );
}

export default function PromoManager({ products }) {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set());
  const [bulkDiscount, setBulkDiscount] = useState(20);
  const [applying, setApplying] = useState(false);
  const [bulkMsg, setBulkMsg] = useState('');

  function toggleSelect(id) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((s) => (s.size === products.length ? new Set() : new Set(products.map((p) => p.id))));
  }

  async function applyBulkDiscount() {
    if (selected.size === 0) {
      setBulkMsg('Pilih minimal satu produk dulu.');
      return;
    }
    const pct = Number(bulkDiscount);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) {
      setBulkMsg('Persen diskon harus antara 1–99.');
      return;
    }
    setApplying(true);
    setBulkMsg('');
    let ok = 0;
    let fail = 0;
    for (const id of selected) {
      const product = products.find((p) => p.id === id);
      if (!product) continue;
      // Harga coret dihitung dari harga jual SAAT INI — harga jual tidak
      // diubah, cuma "harga sebelum diskon" yang ditampilkan disesuaikan
      // supaya persentase diskonnya sesuai yang diminta.
      const newCompare = Math.round(product.price / (1 - pct / 100));
      try {
        await saveProduct(product, newCompare);
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setApplying(false);
    setBulkMsg(fail === 0 ? `Diskon ${pct}% diterapkan ke ${ok} produk.` : `${ok} berhasil, ${fail} gagal.`);
    router.refresh();
  }

  async function clearSelectedPromo() {
    if (selected.size === 0) {
      setBulkMsg('Pilih minimal satu produk dulu.');
      return;
    }
    setApplying(true);
    setBulkMsg('');
    let ok = 0;
    let fail = 0;
    for (const id of selected) {
      const product = products.find((p) => p.id === id);
      if (!product) continue;
      try {
        await saveProduct(product, null);
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setApplying(false);
    setBulkMsg(`Promo dibatalkan untuk ${ok} produk.${fail ? ` ${fail} gagal.` : ''}`);
    router.refresh();
  }

  return (
    <div>
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-section-label" style={{ marginTop: 0 }}>Terapkan Diskon ke Produk Terpilih</div>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>
          Harga jual tidak berubah — hanya harga coret yang diatur supaya menampilkan persentase diskon ini di toko.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13 }}>{selected.size} produk dipilih</span>
          <input
            type="number"
            min="1"
            max="99"
            value={bulkDiscount}
            onChange={(e) => setBulkDiscount(e.target.value)}
            style={{ width: 70, padding: '8px 10px', border: '1px solid var(--line)', fontSize: 13 }}
          />
          <span style={{ fontSize: 13 }}>% off</span>
          <button type="button" className="btn btn--dark" disabled={applying} onClick={applyBulkDiscount}>
            {applying ? 'Menerapkan...' : 'Terapkan'}
          </button>
          <button type="button" className="btn btn--outline" style={{ color: '#C6302B', borderColor: '#C6302B' }} disabled={applying} onClick={clearSelectedPromo}>
            Batalkan Promo
          </button>
        </div>
        {bulkMsg && <p className="admin-msg" style={{ marginTop: 8 }}>{bulkMsg}</p>}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={selected.size === products.length && products.length > 0} onChange={toggleSelectAll} /></th>
              <th>Foto</th>
              <th>Produk</th>
              <th>Harga Jual</th>
              <th>Harga Coret</th>
              <th>Diskon</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <PromoRow key={p.id} product={p} selected={selected.has(p.id)} onToggleSelect={toggleSelect} />
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-empty">Belum ada produk aktif.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
