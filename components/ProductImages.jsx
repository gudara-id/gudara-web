'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TYPE_OPTIONS = [
  { value: 'gallery', label: 'Foto Galeri (utama)' },
  { value: 'size_chart', label: 'Panduan Ukuran' },
  { value: 'reference', label: 'Referensi Desain' },
  { value: 'collar', label: 'Pilihan Kerah' },
];

// Mengelompokkan foto persis seperti lib/products.js mengelompokkannya di
// halaman produk — berdasarkan NAMA FILE, bukan kolom database. Lihat
// catatan di app/api/admin/products/[id]/images/route.js.
function fileNameOf(url) {
  const clean = String(url || '').split('?')[0].split('#')[0];
  const raw = clean.split('/').pop() || '';
  try { return decodeURIComponent(raw); } catch { return raw; }
}
function classify(url) {
  const name = fileNameOf(url);
  if (/size[-_ ]?chart/i.test(name)) return 'size_chart';
  if (/^referensi/i.test(name)) return 'reference';
  if (/^kerah[-_ ]?/i.test(name)) return 'collar';
  return 'gallery';
}

const GROUP_LABELS = {
  gallery: 'Foto Galeri',
  size_chart: 'Panduan Ukuran',
  reference: 'Referensi Desain',
  collar: 'Pilihan Kerah',
};

export default function ProductImages({ productId, images }) {
  const router = useRouter();
  const [type, setType] = useState('gallery');
  const [collarLabel, setCollarLabel] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(false);

  const groups = { gallery: [], size_chart: [], reference: [], collar: [] };
  for (const img of images) groups[classify(img.url)].push(img);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setMsgOk(false);
      setMsg('Pilih file dulu.');
      return;
    }
    setUploading(true);
    setMsg('');
    try {
      const form = new FormData();
      form.set('file', file);
      form.set('image_type', type);
      if (type === 'collar') form.set('collar_label', collarLabel);

      const res = await fetch(`/api/admin/products/${productId}/images`, { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgOk(false);
        setMsg(data.error || 'Gagal upload foto.');
        return;
      }
      setFile(null);
      setCollarLabel('');
      if (e.target.reset) e.target.reset();
      setMsgOk(true);
      setMsg('Foto berhasil diupload.');
      router.refresh();
    } catch {
      setMsgOk(false);
      setMsg('Gagal menghubungi server. Cek koneksi lalu coba lagi.');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(imageId) {
    if (!confirm('Hapus foto ini?')) return;
    setRemovingId(imageId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgOk(false);
        setMsg(data.error || 'Gagal menghapus foto.');
        return;
      }
      router.refresh();
    } catch {
      setMsgOk(false);
      setMsg('Gagal menghubungi server. Cek koneksi lalu coba lagi.');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-section-label" style={{ marginTop: 0 }}>Foto Produk</div>

      <form onSubmit={handleUpload} className="admin-upload-row">
        <div className="field">
          <label>File</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="field">
          <label>Jenis Foto</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {type === 'collar' && (
          <div className="field">
            <label>Label Kerah (mis. "A", "Tinggi")</label>
            <input value={collarLabel} onChange={(e) => setCollarLabel(e.target.value)} placeholder="A" />
          </div>
        )}
        <button className="btn btn--dark" disabled={uploading} style={{ height: 46 }}>
          {uploading ? 'Mengupload...' : 'Upload Foto'}
        </button>
      </form>
      {msg && <p className="admin-msg" style={{ color: msgOk ? '#16A34A' : '#C6302B', marginBottom: 16 }}>{msg}</p>}

      {Object.keys(GROUP_LABELS).map((key) => (
        <div key={key}>
          <div className="admin-section-label">{GROUP_LABELS[key]}</div>
          {groups[key].length === 0 ? (
            <p className="admin-image-empty">Belum ada foto.</p>
          ) : (
            <div className="admin-image-grid">
              {groups[key].map((img) => (
                <div key={img.id} className="admin-image-tile">
                  <img src={img.url} alt="" />
                  <button
                    type="button"
                    className="admin-image-tile__remove"
                    disabled={removingId === img.id}
                    onClick={() => handleRemove(img.id)}
                    aria-label="Hapus foto"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
