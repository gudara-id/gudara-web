'use client';

import { useState } from 'react';

function Stars({ value, size = 16 }) {
  return (
    <span aria-label={`${value} dari 5 bintang`} style={{ color: '#D97706', fontSize: size, letterSpacing: 1 }}>
      {'★'.repeat(Math.round(value))}
      {'☆'.repeat(5 - Math.round(value))}
    </span>
  );
}

export default function ProductReviews({ productId, reviews, summary }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderNumber: '', phone: '', reviewerName: '', rating: 5, comment: '' });
  const [submitState, setSubmitState] = useState({ loading: false, error: null, success: false });

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitState({ loading: true, error: null, success: false });
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim review.');
      setSubmitState({ loading: false, error: null, success: true });
      setForm({ orderNumber: '', phone: '', reviewerName: '', rating: 5, comment: '' });
    } catch (err) {
      setSubmitState({ loading: false, error: err.message, success: false });
    }
  }

  return (
    <section className="pdp-related" id="review-produk">
      <div className="section-head">
        <div>
          <span className="eyebrow">Kata Pembeli</span>
          <h2>
            Review Produk{' '}
            {summary.count > 0 && (
              <span style={{ fontSize: 16, fontWeight: 400 }}>
                <Stars value={summary.average} /> {summary.average} ({summary.count} ulasan)
              </span>
            )}
          </h2>
        </div>
        <button type="button" className="see-all" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Tutup' : 'Tulis Review →'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: '0 0 32px', display: 'grid', gap: 10 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            Review hanya bisa dikirim untuk pesanan yang sudah berstatus <strong>Selesai</strong>.
          </p>
          <input
            required
            placeholder="Nomor Pesanan (mis. GDR-20260824-0001)"
            value={form.orderNumber}
            onChange={(e) => updateField('orderNumber', e.target.value)}
          />
          <input
            required
            placeholder="Nomor HP saat checkout"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
          <input
            required
            placeholder="Nama kamu"
            value={form.reviewerName}
            onChange={(e) => updateField('reviewerName', e.target.value)}
          />
          <select value={form.rating} onChange={(e) => updateField('rating', Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} Bintang
              </option>
            ))}
          </select>
          <textarea
            placeholder="Ceritakan pengalamanmu (opsional)"
            rows={3}
            value={form.comment}
            onChange={(e) => updateField('comment', e.target.value)}
          />
          <button type="submit" className="btn btn--dark" disabled={submitState.loading}>
            {submitState.loading ? 'Mengirim...' : 'Kirim Review'}
          </button>
          {submitState.error && <p style={{ color: '#DC2626', fontSize: 13 }}>{submitState.error}</p>}
          {submitState.success && (
            <p style={{ color: '#16A34A', fontSize: 13 }}>
              Terima kasih! Review kamu sedang ditinjau sebelum tampil publik.
            </p>
          )}
        </form>
      )}

      {reviews.length === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Belum ada review untuk produk ini.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ borderBottom: '1px solid var(--line, #eee)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 14 }}>{r.reviewer_name}</strong>
                <Stars value={r.rating} size={13} />
              </div>
              {r.comment && <p style={{ fontSize: 14, marginTop: 6 }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
