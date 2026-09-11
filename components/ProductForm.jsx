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

const GENDER_OPTIONS = [
  { value: 'unisex', label: 'Unisex' },
  { value: 'man', label: 'Man' },
  { value: 'woman', label: 'Woman' },
  { value: 'kids', label: 'Kids' },
];

export default function ProductForm({ mode, product, categories, onCreated, submitLabel }) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const categoryOptions = categories?.length ? categories : [{ slug: product?.category, name: product?.category }];
  // Kelompokkan kategori per induk (mis. "Sport Authentic" menaungi
  // "Badminton"/"Running"/"Sepak Bola") supaya checkbox-nya tidak sejajar
  // membingungkan — kategori tanpa induk tampil sebagai grup tersendiri.
  const topLevel = categoryOptions.filter((c) => !c.parent_slug);
  const groupedOptions = topLevel.map((parent) => ({
    ...parent,
    children: categoryOptions.filter((c) => c.parent_slug === parent.slug),
  }));

  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  // Produk lama cuma punya 1 category (kolom lama); product?.categorySlugs
  // (kalau dikirim halaman edit) berisi semua slug yang sudah ter-link lewat
  // product_category_links, dipakai supaya checkbox yang sudah tercentang
  // sebelumnya tampil benar saat form dibuka.
  const initialCategories = product?.categorySlugs?.length
    ? product.categorySlugs
    : product?.category
    ? [product.category]
    : categoryOptions[0]?.slug
    ? [categoryOptions[0].slug]
    : [];
  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [gender, setGender] = useState(product?.gender || 'unisex');
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

  function toggleCategory(catSlug) {
    setSelectedCategories((prev) =>
      prev.includes(catSlug) ? prev.filter((s) => s !== catSlug) : [...prev, catSlug]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedCategories.length) {
      setMsgOk(false);
      setMsg('Pilih minimal satu kategori.');
      return;
    }
    setLoading(true);
    setMsg('');

    const payload = {
      name,
      slug,
      categories: selectedCategories,
      gender,
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
      } else if (onCreated) {
        // Dipakai oleh alur "Tambah Produk" satu halaman (ProductWizard) —
        // lanjut ke langkah foto/varian di halaman yang sama, tanpa pindah
        // halaman dulu seperti sebelumnya.
        onCreated({ id: data.id, slug: data.slug, name, categories: selectedCategories });
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
        <div className="field field--full">
          <label>Kategori (bisa pilih lebih dari satu)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groupedOptions.map((group) => (
              <div key={group.slug}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--body)', textTransform: 'none', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(group.slug)}
                    onChange={() => toggleCategory(group.slug)}
                  />
                  {group.name}
                </label>
                {group.children.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginLeft: 24, marginTop: 4 }}>
                    {group.children.map((child) => (
                      <label key={child.slug} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--body)', textTransform: 'none', fontSize: 13, color: 'var(--ink-soft)' }}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(child.slug)}
                          onChange={() => toggleCategory(child.slug)}
                        />
                        {child.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            {GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
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
          <label>Harga Coret / Promo (opsional)</label>
          <input type="number" min="0" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="Isi kalau produk ini lagi promo" />
          {comparePrice !== '' && Number(comparePrice) > Number(price) && Number(price) > 0 && (
            <p style={{ fontSize: 12, color: '#16A34A', marginTop: 4 }}>
              Tampil diskon {Math.round((1 - Number(price) / Number(comparePrice)) * 100)}% di toko (harga coret {Number(comparePrice).toLocaleString('id-ID')} → {Number(price).toLocaleString('id-ID')}).
            </p>
          )}
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
            {loading ? 'Menyimpan...' : submitLabel || (isEdit ? 'Simpan Perubahan' : 'Buat Produk')}
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
