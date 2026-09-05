'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JournalImages({ postId, coverUrl, gallery = [] }) {
  const router = useRouter();
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFile, setGalleryFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(false);

  async function upload(file, type, extra = {}) {
    const form = new FormData();
    form.set('file', file);
    form.set('image_type', type);
    Object.entries(extra).forEach(([k, v]) => form.set(k, v));
    const res = await fetch(`/api/admin/journal/${postId}/images`, { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Gagal upload foto.');
    return data;
  }

  async function handleCoverUpload(e) {
    e.preventDefault();
    if (!coverFile) { setMsgOk(false); setMsg('Pilih file cover dulu.'); return; }
    setUploadingCover(true);
    setMsg('');
    try {
      await upload(coverFile, 'cover');
      setCoverFile(null);
      if (e.target.reset) e.target.reset();
      setMsgOk(true);
      setMsg('Foto cover berhasil diupload.');
      router.refresh();
    } catch (err) {
      setMsgOk(false);
      setMsg(err.message);
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleGalleryUpload(e) {
    e.preventDefault();
    if (!galleryFile) { setMsgOk(false); setMsg('Pilih file galeri dulu.'); return; }
    setUploadingGallery(true);
    setMsg('');
    try {
      await upload(galleryFile, 'gallery', { caption });
      setGalleryFile(null);
      setCaption('');
      if (e.target.reset) e.target.reset();
      setMsgOk(true);
      setMsg('Foto galeri berhasil diupload.');
      router.refresh();
    } catch (err) {
      setMsgOk(false);
      setMsg(err.message);
    } finally {
      setUploadingGallery(false);
    }
  }

  async function handleRemove(imageId) {
    if (!confirm('Hapus foto ini?')) return;
    setRemovingId(imageId);
    try {
      const res = await fetch(`/api/admin/journal/${postId}/images/${imageId}`, { method: 'DELETE' });
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
      <div className="admin-section-label" style={{ marginTop: 0 }}>Foto Cover</div>
      <form onSubmit={handleCoverUpload} className="admin-upload-row">
        <div className="field">
          <label>File Cover</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
        </div>
        <button className="btn btn--dark" disabled={uploadingCover} style={{ height: 46 }}>
          {uploadingCover ? 'Mengupload...' : 'Upload Cover'}
        </button>
      </form>
      {coverUrl ? (
        <div className="admin-image-grid" style={{ marginBottom: 16 }}>
          <div className="admin-image-tile">
            <img src={coverUrl} alt="" />
          </div>
        </div>
      ) : (
        <p className="admin-image-empty">Belum ada foto cover.</p>
      )}

      <div className="admin-section-label">Foto Galeri Tambahan</div>
      <form onSubmit={handleGalleryUpload} className="admin-upload-row">
        <div className="field">
          <label>File</label>
          <input type="file" accept="image/*" onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} />
        </div>
        <div className="field">
          <label>Keterangan (opsional)</label>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Keterangan foto" />
        </div>
        <button className="btn btn--dark" disabled={uploadingGallery} style={{ height: 46 }}>
          {uploadingGallery ? 'Mengupload...' : 'Upload Foto'}
        </button>
      </form>
      {msg && <p className="admin-msg" style={{ color: msgOk ? '#16A34A' : '#C6302B', marginBottom: 16 }}>{msg}</p>}

      {gallery.length === 0 ? (
        <p className="admin-image-empty">Belum ada foto galeri.</p>
      ) : (
        <div className="admin-image-grid">
          {gallery.map((img) => (
            <div key={img.id} className="admin-image-tile">
              <img src={img.url} alt={img.caption || ''} />
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
  );
}
