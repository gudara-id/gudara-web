'use client';

import Script from 'next/script';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { formatRp } from '@/lib/format';

const PAY_OPTIONS = [
  { id: 'qris', label: 'QRIS' },
  { id: 'va', label: 'Transfer Bank / Virtual Account' },
  { id: 'ewallet', label: 'E-Wallet (GoPay / OVO / Dana)' },
  { id: 'cc', label: 'Kartu Kredit / Debit' },
];

const SNAP_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const [payMethod, setPayMethod] = useState('qris');
  const [snapReady, setSnapReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recipient, setRecipient] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [postalCode, setPostalCode] = useState("");
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);

  function updateField(field, value) {
    setRecipient((prev) => ({ ...prev, [field]: value }));
  }

  async function submitOrder() {
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Keranjangmu masih kosong.');
      return;
    }
    if (!recipient.name || !recipient.phone || !recipient.address || !recipient.city || !recipient.postalCode) {
      setErrorMsg('Lengkapi dulu alamat pengiriman ya.');
      return;
    }
    if (!snapReady || !window.snap) {
      setErrorMsg('Payment sedang dimuat, coba lagi sebentar.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, recipient, paymentMethod: payMethod }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal membuat transaksi.');
        setSubmitting(false);
        return;
      }

      window.snap.pay(data.snapToken, {
        onSuccess: () => {
          clearCart();
          router.push('/');
        },
        onPending: () => {
          clearCart();
          router.push('/');
        },
        onError: () => {
          setErrorMsg('Pembayaran gagal. Coba lagi.');
        },
        onClose: () => {
          setSubmitting(false);
        },
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }
  
  async function checkRates() {
  setLoadingRates(true);
  const res = await fetch("/api/shipping/rates", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      destinationPostalCode: postalCode,
      items: cartItems.map((it) => ({
        name: it.name,
        price: it.price,
        weight: it.weight,
        quantity: it.qty,
      })),
    }),
  });
  const data = await res.json();
  setShippingOptions(data.options || []);
  setLoadingRates(false);
}
  return (
    <>
      <Script
        src={SNAP_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setSnapReady(true)}
      />
      <section className="wrap" style={{ padding: '56px 0 96px' }}>
        <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', marginBottom: 32 }}>Checkout</h1>
        <div className="checkout-grid">
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>1. Alamat Pengiriman</div>
            <div className="field">
              <label>Nama Penerima</label>
              <input
                type="text"
                placeholder="Nama lengkap"
                value={recipient.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div className="field">
              <label>No. WhatsApp</label>
              <input
                type="text"
                placeholder="08xxxxxxxxxx"
                value={recipient.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Alamat Lengkap</label>
              <textarea
                rows={3}
                placeholder="Nama jalan, no rumah, kelurahan"
                value={recipient.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Kota</label>
                <input
                  type="text"
                  placeholder="Kota"
                  value={recipient.city}
                  onChange={(e) => updateField('city', e.target.value)}
                />
              </div>
              <div className="field">
                <label>Kode Pos</label>
                <input
                  type="text"
                  placeholder="Kode pos"
                  value={recipient.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                />
              </div>
            </div>

            <div className="eyebrow" style={{ margin: '28px 0 12px' }}>2. Metode Pembayaran</div>
            {PAY_OPTIONS.map((opt) => (
              <div
                key={opt.id}
                className={`pay-option${payMethod === opt.id ? ' selected' : ''}`}
                onClick={() => setPayMethod(opt.id)}
              >
                <input type="radio" name="pay" checked={payMethod === opt.id} readOnly /> {opt.label}
              </div>
            ))}

            {errorMsg && (
              <p style={{ fontSize: 13, color: '#C6302B', marginTop: 12 }}>{errorMsg}</p>
            )}
          </div>

          <div className="summary-box">
            <div className="eyebrow" style={{ marginBottom: 16 }}>Ringkasan Pesanan</div>
            <div style={{ marginBottom: 12 }}>
              {cart.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Keranjang kosong.</p>
              ) : (
                cart.map((i) => (
                  <div
                    key={`${i.id}-${i.variant}`}
                    style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}
                  >
                    <span>{i.name} × {i.qty}</span>
                    <span className="price">{formatRp(i.price * i.qty)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="summary-row"><span>Subtotal</span><span className="price">{formatRp(cartTotal)}</span></div>
            <div className="summary-row"><span>Ongkir</span><span>Rp 0 (contoh)</span></div>
            <div className="summary-row total"><span>Total</span><span>{formatRp(cartTotal)}</span></div>
            <button
              className="btn btn--accent"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16, opacity: submitting ? 0.6 : 1 }}
              onClick={submitOrder}
              disabled={submitting}
            >
              {submitting ? 'Memproses...' : 'Bayar Sekarang'}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
