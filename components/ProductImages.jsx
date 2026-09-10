'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { compressImage, formatBytes } from '@/lib/imageCompress';

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

// queue item status: 'pending' | 'compressing' | 'uploading' | 'done' | 'error'

export default function ProductImages({ productId, images, colors = [] }) {
  const router = useRouter();
  const [type, setType] = useState('gallery');
  const [collarLabel, setCollarLabel] = useState('');
  const [variantColor, setVariantColor] = useState('');
  const [queue, setQueue] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const groups = { gallery: [], size_chart: [], reference: [], collar: [] };
  for (const img of images) groups[classify(img.url)].push(img);

  // Kelompokkan foto galeri per warna varian, supaya kelihatan mana yang
  // sudah ditag dan mana yang belum. "Umum" = variant_color kosong, dipakai
  // sebagai fallback untuk warna yang belum ada foto khususnya.
  const galleryByColor = new Map();
  for (const img of groups.gallery) {
    const key = img.variant_color || '';
    if (!galleryByColor.has(key)) galleryByColor.set(key, []);
    galleryByColor.get(key).push(img);
  }

  function addFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type?.startsWith('image/'));
    if (!files.length) return;
    const items = files.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file: f,
      status: 'pending',
      originalSize: f.size,
      compressedSize: null,
      error: null,
    }));
    setQueue((q) => [...q, ...items]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer?.files);
  }

  function removeFromQueue(id) {
    setQueue((q) => q.filter((it) => it.id !== id));
  }

  async function handleUploadAll(e) {
    e.preventDefault();
    if (queue.length === 0) {
      setMsgOk(false);
      setMsg('Pilih atau seret foto dulu.');
      return;
    }
    setUploading(true);
    setMsg('');

    let successCount = 0;
    let failCount = 0;

    // Upload berurutan (bukan paralel) supaya urutan foto & sort_order di
    // server tetap sesuai urutan pilihan admin, dan supaya tidak membanjiri
    // koneksi HP admin dengan banyak upload sekaligus.
    for (const item of queue) {
      setQueue((q) => q.map((it) => (it.id === item.id ? { ...it, status: 'compressing' } : it)));
      let toUpload = item.file;
      let compressedSize = item.originalSize;
      try {
        const result = await compressImage(item.file);
        toUpload = result.file;
        compressedSize = result.compressedSize;
      } catch {
        // Kompresi gagal — lanjut upload file aslinya saja.
      }

      setQueue((q) => q.map((it) => (it.id === item.id ? { ...it, status: 'uploading', compressedSize } : it)));

      try {
        const form = new FormData();
        form.set('file', toUpload);
        form.set('image_type', type);
        if (type === 'collar') form.set('collar_label', collarLabel);
        if (type === 'gallery' && variantColor) form.set('variant_color', variantColor);

        const res = await fetch(`/api/admin/products/${productId}/images`, { method: 'POST', body: form });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setQueue((q) => q.map((it) => (it.id === item.id ? { ...it, status: 'error', error: data.error || 'Gagal upload.' } : it)));
          failCount += 1;
          continue;
        }
        setQueue((q) => q.map((it) => (it.id === item.id ? { ...it, status: 'done' } : it)));
        successCount += 1;
      } catch {
        setQueue((q) => q.map((it) => (it.id === item.id ? { ...it, status: 'error', error: 'Gagal menghubungi server.' } : it)));
        failCount += 1;
      }
    }

    setUploading(false);
    setCollarLabel('');
    setVariantColor('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (failCount === 0) {
      setMsgOk(true);
      setMsg(successCount > 1 ? `${successCount} foto berhasil diupload.` : 'Foto berhasil diupload.');
      setQueue([]);
    } else {
      setMsgOk(false);
      setMsg(`${successCount} berhasil, ${failCount} gagal. Foto yang gagal masih ada di daftar — coba upload ulang.`);
      setQueue((q) => q.filter((it) => it.status === 'error'));
    }
    router.refresh();
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

  const STATUS_LABEL = {
    pending: 'Menunggu',
    compressing: 'Mengecilkan ukuran...',
    uploading: 'Mengupload...',
    done: 'Selesai',
    error: 'Gagal',
  };

  return (
    <div className="admin-card">
      <div className="admin-section-label" style={{ marginTop: 0 }}>Foto Produk</div>
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: -8, marginBottom: 16 }}>
        Bisa pilih atau seret beberapa foto sekaligus — setiap foto otomatis dikecilkan ukurannya supaya website tetap cepat dibuka pembeli.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Jenis Foto</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {type === 'collar' && (
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Label Kerah (mis. "A", "Tinggi")</label>
            <input value={collarLabel} onChange={(e) => setCollarLabel(e.target.value)} placeholder="A" />
          </div>
        )}
        {type === 'gallery' && colors.length > 0 && (
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Untuk Varian Warna (opsional)</label>
            <select value={variantColor} onChange={(e) => setVariantColor(e.target.value)}>
              <option value="">Semua warna / umum</option>
              {colors.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
      </div>

      <div
        className={`admin-dropzone${dragOver ? ' is-dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
        />
        <p className="admin-dropzone__title">Klik untuk pilih foto, atau seret &amp; lepas di sini</p>
        <p className="admin-dropzone__hint">Bisa banyak foto sekaligus &middot; JPG/PNG &middot; otomatis dikecilkan sebelum diupload</p>
      </div>

      {queue.length > 0 && (
        <div className="admin-upload-queue">
          {queue.map((it) => (
            <div key={it.id} className="admin-upload-queue__row">
              <span className="admin-upload-queue__name">{it.file.name}</span>
              <span className="admin-upload-queue__size">
                {formatBytes(it.originalSize)}
                {it.compressedSize != null && it.compressedSize !== it.originalSize && (
                  <> &rarr; {formatBytes(it.compressedSize)}</>
                )}
              </span>
              <span className={`admin-upload-queue__status is-${it.status}`}>
                {it.status === 'error' ? (it.error || 'Gagal') : STATUS_LABEL[it.status]}
              </span>
              {(it.status === 'pending' || it.status === 'error') && (
                <button type="button" className="admin-upload-queue__remove" onClick={() => removeFromQueue(it.id)} aria-label="Batalkan">
                  ×
                </button>
              )}
            </div>
          ))}
          <button className="btn btn--dark" disabled={uploading} style={{ marginTop: 12 }} onClick={handleUploadAll}>
            {uploading ? 'Mengupload...' : `Upload ${queue.length} Foto`}
          </button>
        </div>
      )}

      {msg && <p className="admin-msg" style={{ color: msgOk ? '#16A34A' : '#C6302B', marginTop: queue.length ? 12 : 0, marginBottom: 16 }}>{msg}</p>}

      {Object.keys(GROUP_LABELS).map((key) => {
        // Foto galeri produk yang punya varian warna ditampilkan per
        // kelompok warna, supaya kelihatan langsung warna mana yang belum
        // ada fotonya. Grup lain (size_chart/reference/collar) tetap seperti
        // biasa karena tidak berhubungan dengan warna varian.
        if (key === 'gallery' && colors.length > 0) {
          return (
            <div key={key}>
              <div className="admin-section-label">{GROUP_LABELS[key]}</div>
              {groups.gallery.length === 0 ? (
                <p className="admin-image-empty">Belum ada foto.</p>
              ) : (
                [...galleryByColor.entries()].map(([colorKey, imgs]) => (
                  <div key={colorKey || '__umum__'} style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>
                      {colorKey || 'Umum (semua warna)'}
                    </p>
                    <div className="admin-image-grid">
                      {imgs.map((img) => (
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
                  </div>
                ))
              )}
            </div>
          );
        }

        return (
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
        );
      })}
    </div>
  );
}
