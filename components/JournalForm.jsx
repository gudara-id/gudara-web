'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { value: 'berita', label: 'Berita' },
  { value: 'event', label: 'Event' },
  { value: 'portofolio', label: 'Portofolio' },
];

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function JournalForm({ mode, post }) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(post?.category || 'berita');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [eventDate, setEventDate] = useState(post?.event_date || '');
  const [isPublished, setIsPublished] = useState(post?.is_published ?? true);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(false);

  function handleTitleChange(v) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const payload = {
      title,
      slug,
      category,
      excerpt,
      content,
      event_date: eventDate || null,
      is_published: isPublished,
    };

    try {
      const url = isEdit ? `/api/admin/journal/${post.id}` : '/api/admin/journal';
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgOk(false);
        setMsg(data.error || 'Gagal menyimpan postingan.');
        return;
      }
      if (isEdit) {
        setMsgOk(true);
        setMsg('Perubahan tersimpan.');
        router.refresh();
      } else {
        router.push(`/admin/jurnal/${data.id}`);
      }
    } catch {
      setMsgOk(false);
      setMsg('Gagal menghubungi server. Cek koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Hapus postingan "${post.title}"? Foto yang menempel juga akan terhapus. Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/journal/${post.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgOk(false);
        setMsg(data.error || 'Gagal menghapus postingan.');
        setDeleting(false);
        return;
      }
      router.push('/admin/jurnal');
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
        <div className="field field--full">
          <label>Judul</label>
          <input value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
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
        <div className="field">
          <label>Tanggal Event (opsional)</label>
          <input type="date" value={eventDate || ''} onChange={(e) => setEventDate(e.target.value)} />
        </div>
        <div className="field field--checkbox" style={{ alignSelf: 'end', marginBottom: 16 }}>
          <input
            type="checkbox"
            id="is_published"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <label htmlFor="is_published" style={{ textTransform: 'none', fontFamily: 'var(--body)', fontSize: 14, color: 'var(--ink)' }}>
            Terbitkan (tampil di /jurnal)
          </label>
        </div>
        <div className="field field--full">
          <label>Ringkasan (tampil di kartu jurnal)</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div className="field field--full">
          <label>Isi Postingan</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Pisahkan tiap paragraf dengan baris kosong."
          />
        </div>
      </div>

      <div className="admin-actions" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--dark" disabled={loading}>
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Postingan'}
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
            {deleting ? 'Menghapus...' : 'Hapus Postingan'}
          </button>
        )}
        {msg && <p className="admin-msg" style={{ color: msgOk ? '#16A34A' : '#C6302B' }}>{msg}</p>}
      </div>
    </form>
  );
}
