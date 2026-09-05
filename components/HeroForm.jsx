'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroForm({ hero }) {
  const router = useRouter();

  const [eyebrow, setEyebrow] = useState(hero?.eyebrow || '');
  const [headline, setHeadline] = useState(hero?.headline || '');
  const [description, setDescription] = useState(hero?.description || '');
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState(hero?.cta_primary_label || '');
  const [ctaPrimaryHref, setCtaPrimaryHref] = useState(hero?.cta_primary_href || '');
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState(hero?.cta_secondary_label || '');
  const [ctaSecondaryHref, setCtaSecondaryHref] = useState(hero?.cta_secondary_href || '');
  const [imageUrl, setImageUrl] = useState(hero?.image_url || '');
  const [imageFile, setImageFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eyebrow,
          headline,
          description,
          cta_primary_label: ctaPrimaryLabel,
          cta_primary_href: ctaPrimaryHref,
          cta_secondary_label: ctaSecondaryLabel,
          cta_secondary_href: ctaSecondaryHref,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgOk(false);
        setMsg(data.error || 'Gagal menyimpan campaign.');
        return;
      }
      setMsgOk(true);
      setMsg('Perubahan tersimpan. Cek beranda untuk lihat hasilnya.');
      router.refresh();
    } catch {
      setMsgOk(false);
      setMsg('Gagal menghubungi server. Cek koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e) {
    e.preventDefault();
    if (!imageFile) { setMsgOk(false); setMsg('Pilih file foto dulu.'); return; }
    setUploading(true);
    setMsg('');
    try {
      const form = new FormData();
      form.set('file', imageFile);
      const res = await fetch('/api/admin/hero/image', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgOk(false);
        setMsg(data.error || 'Gagal upload foto.');
        return;
      }
      setImageUrl(data.url);
      setImageFile(null);
      if (e.target.reset) e.target.reset();
      setMsgOk(true);
      setMsg('Foto hero berhasil diupload.');
      router.refresh();
    } catch {
      setMsgOk(false);
      setMsg('Gagal menghubungi server. Cek koneksi lalu coba lagi.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div className="admin-card">
        <div className="admin-section-label" style={{ marginTop: 0 }}>Foto Hero</div>
        {imageUrl && (
          <div className="admin-image-grid" style={{ marginBottom: 16 }}>
            <div className="admin-image-tile" style={{ aspectRatio: '16/9', width: '100%', maxWidth: 480 }}>
              <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        )}
        <form onSubmit={handleImageUpload} className="admin-upload-row">
          <div className="field">
            <label>File Foto Baru (disarankan landscape, min. 1600px lebar)</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </div>
          <button className="btn btn--dark" disabled={uploading} style={{ height: 46 }}>
            {uploading ? 'Mengupload...' : 'Ganti Foto Hero'}
          </button>
        </form>
      </div>

      <form onSubmit={handleSave} className="admin-card">
        <div className="admin-section-label" style={{ marginTop: 0 }}>Teks & Tombol Campaign</div>
        <div className="admin-form-grid">
          <div className="field field--full">
            <label>Eyebrow (label kecil di atas judul)</label>
            <input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} placeholder="Move Faster Collection" />
          </div>
          <div className="field field--full">
            <label>Headline (Enter = baris baru, seperti "MOVE / FASTER.")</label>
            <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={2} required />
          </div>
          <div className="field field--full">
            <label>Deskripsi</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="field">
            <label>Label Tombol Utama</label>
            <input value={ctaPrimaryLabel} onChange={(e) => setCtaPrimaryLabel(e.target.value)} placeholder="Belanja Sekarang" />
          </div>
          <div className="field">
            <label>Link Tombol Utama</label>
            <input value={ctaPrimaryHref} onChange={(e) => setCtaPrimaryHref(e.target.value)} placeholder="/etalase" />
          </div>
          <div className="field">
            <label>Label Tombol Kedua (opsional)</label>
            <input value={ctaSecondaryLabel} onChange={(e) => setCtaSecondaryLabel(e.target.value)} placeholder="Mulai Custom Jersey" />
          </div>
          <div className="field">
            <label>Link Tombol Kedua (opsional)</label>
            <input value={ctaSecondaryHref} onChange={(e) => setCtaSecondaryHref(e.target.value)} placeholder="/custom" />
          </div>
        </div>

        <div className="admin-actions">
          <button className="btn btn--dark" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Campaign'}
          </button>
          {msg && <p className="admin-msg" style={{ color: msgOk ? '#16A34A' : '#C6302B' }}>{msg}</p>}
        </div>
      </form>
    </>
  );
}
