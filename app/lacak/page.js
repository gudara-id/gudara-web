'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatRp } from '@/lib/format';
import { statusMeta } from '@/lib/orderStatus';

const TIMELINE_STEPS = [
  { key: 'paid', label: 'Dibayar' },
  { key: 'processing', label: 'Diproses' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'completed', label: 'Selesai' },
];

function stepIndex(status) {
  if (status === 'cancelled' || status === 'expired' || status === 'pending_payment') return -1;
  return TIMELINE_STEPS.findIndex((s) => s.key === status);
}

function LacakForm() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setErrorMsg('Isi nomor pesanan dan No. HP dulu ya.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setResult(null);
    try {
      const res = await fetch('/api/lacak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Pesanan tidak ditemukan.');
        return;
      }
      setResult(data);
    } catch (err) {
      setErrorMsg('Gagal menghubungi server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-lookup kalau datang dari link sukses checkout dan No. HP sudah pernah diisi di sesi ini.
  useEffect(() => {
    const orderFromUrl = searchParams.get('order');
    if (orderFromUrl) setOrderNumber(orderFromUrl);
  }, [searchParams]);

  function copyResi() {
    if (!result?.waybillId) return;
    navigator.clipboard.writeText(result.waybillId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const meta = result ? statusMeta(result.status) : null;
  const activeStep = result ? stepIndex(result.status) : -1;
  const isCancelled = result?.status === 'cancelled' || result?.status === 'expired';
  const isPendingPayment = result?.status === 'pending_payment';

  return (
    <section className="wrap" style={{ padding: '56px 0 96px', maxWidth: 720, margin: '0 auto' }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Tracking</div>
      <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', marginBottom: 8 }}>Lacak Pesanan</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 32 }}>
        Masukkan nomor pesanan dan No. HP yang kamu gunakan saat checkout untuk melihat status &amp; resi.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
        <div className="field">
          <label>Nomor Pesanan</label>
          <input
            type="text"
            placeholder="GDR-xxxxxxxxxxxxx"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </div>
        <div className="field">
          <label>No. HP</label>
          <input
            type="text"
            placeholder="08xxxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn--dark" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Mencari...' : 'Lacak Pesanan'}
        </button>
        {errorMsg && <p style={{ color: '#C6302B', fontSize: 13, marginTop: 10 }}>{errorMsg}</p>}
      </form>

      {result && (
        <div className="admin-card">
          <div className="admin-head" style={{ marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, margin: 0 }}>{result.orderNumber}</h2>
              <p className="admin-head__meta">
                {new Date(result.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
            <span className="admin-status">
              <span className="admin-status__dot" style={{ background: meta.color }} />
              {meta.label}
            </span>
          </div>

          {isPendingPayment && (
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 20 }}>
              Pesanan ini masih menunggu pembayaran.
            </p>
          )}

          {isCancelled && (
            <p style={{ fontSize: 14, color: '#C6302B', marginBottom: 20 }}>
              Pesanan ini {result.status === 'cancelled' ? 'telah dibatalkan' : 'kedaluwarsa'}.
            </p>
          )}

          {!isPendingPayment && !isCancelled && (
            <div className="lacak-timeline">
              {TIMELINE_STEPS.map((step, i) => (
                <div key={step.key} className={`lacak-timeline__step${i <= activeStep ? ' is-done' : ''}`}>
                  <span className="lacak-timeline__dot" />
                  <span className="lacak-timeline__label">{step.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="admin-section-label" style={{ marginTop: 24 }}>Item</div>
          {result.items.map((it, i) => (
            <div key={i} className="admin-line-item">
              <span>{it.name} {it.variant ? `(${it.variant})` : ''} × {it.qty}</span>
              <span>{formatRp(it.lineTotal)}</span>
            </div>
          ))}
          <div className="admin-totals">
            <div className="admin-line-item"><span>Subtotal</span><span>{formatRp(result.subtotal)}</span></div>
            <div className="admin-line-item"><span>Ongkir</span><span>{formatRp(result.shippingCost)}</span></div>
            <div className="admin-line-item admin-line-item--grand"><span>Total</span><span>{formatRp(result.total)}</span></div>
          </div>

          {result.waybillId ? (
            <>
              <div className="admin-section-label">Pengiriman</div>
              <p style={{ marginBottom: 4 }}>
                Kurir: <strong>{result.courierCompany?.toUpperCase()} — {result.courierServiceName}</strong>
              </p>
              <p style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                No. Resi: <strong>{result.waybillId}</strong>
                <button type="button" onClick={copyResi} className="btn btn--outline" style={{ padding: '4px 12px', fontSize: 12, color: 'var(--ink)', borderColor: 'var(--ink)' }}>
                  {copied ? 'Tersalin!' : 'Salin'}
                </button>
              </p>
              {result.courierLink && (
                <a href={result.courierLink} target="_blank" rel="noopener noreferrer" className="btn btn--dark" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                  Lacak di Website Kurir
                </a>
              )}
            </>
          ) : (
            !isPendingPayment &&
            !isCancelled && (
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 20 }}>
                Resi belum tersedia — akan muncul di sini begitu paket diserahkan ke kurir.
              </p>
            )
          )}

          <a
            href={`https://wa.me/628131648947?text=${encodeURIComponent(`Halo Admin Gudara, saya mau tanya soal pesanan ${result.orderNumber}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
            style={{ width: '100%', justifyContent: 'center', color: 'var(--ink)', borderColor: 'var(--ink)', marginTop: 12 }}
          >
            Ada Kendala? Chat Admin
          </a>
        </div>
      )}
    </section>
  );
}

export default function LacakPage() {
  return (
    <Suspense fallback={null}>
      <LacakForm />
    </Suspense>
  );
}
