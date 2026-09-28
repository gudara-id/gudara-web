'use client';

import Script from 'next/script';
import { useState, useEffect, useRef } from 'react';
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
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const debounceRef = useRef(null);

  function updateField(field, value) {
    setRecipient((prev) => ({ ...prev, [field]: value }));
    if (field === 'postalCode') {
      setShippingOptions([]);
      setSelectedShipping(null);
    }
  }

  async function checkRates() {
    if (!recipient.postalCode) {
      setErrorMsg('Isi kode pos dulu ya.');
      return;
    }
    setErrorMsg('');
    setLoadingRates(true);
    setSelectedShipping(null);
    try {
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationPostalCode: recipient.postalCode,
          items: cart.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal cek ongkir.');
        setShippingOptions([]);
      } else {
        setShippingOptions(data.options || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal cek ongkir. Coba lagi.');
    } finally {
      setLoadingRates(false);
    }
  }

  // Otomatis cek ongkir begitu kode pos terisi 5 digit, dengan debounce
  useEffect(() => {
    if (recipient.postalCode.length !== 5) {
      setShippingOptions([]);
      setSelectedShipping(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      checkRates();
    }, 600);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipient.postalCode, cart.length]);

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
    if (!selectedShipping) {
      setErrorMsg('Pilih kurir pengiriman dulu ya.');
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
        body: JSON.stringify({
          items: cart,
          recipient,
          paymentMethod: payMethod,
          shipping: {
            courier_company: selectedShipping.courier_company,
            courier_type: selectedShipping.courier_type,
          },
        }),
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
          router.push(`/lacak?order=${encodeURIComponent(data.orderNumber)}`);
        },
        onPending: () => {
          clearCart();
          router.push(`/lacak?order=${encodeURIComponent(data.orderNumber)}`);
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

            <button
              type="button"
              className="btn"
              style={{ marginTop: 8 }}
              onClick={checkRates}
              disabled={loadingRates || !recipient.postalCode}
            >
              {loadingRates ? 'Mengecek...' : shippingOptions.length > 0 ? 'Cek Ulang Ongkir' : 'Cek Ongkir'}
            </button>

            {shippingOptions.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {shippingOptions.map((opt) => (
                  <div
                    key={`${opt.courier_company}-${opt.courier_type}`}
                    className={`pay-option${
                      selectedShipping?.courier_company === opt.courier_company &&
                      selectedShipping?.courier_type === opt.courier_type
                        ? ' selected'
                        : ''
                    }`}
                    onClick={() => setSelectedShipping(opt)}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={
                        selectedShipping?.courier_company === opt.courier_company &&
                        selectedShipping?.courier_type === opt.courier_type
                      }
                      readOnly
                    />{' '}
                    {opt.courier_name} - {opt.courier_service_name} ({opt.duration}) — {formatRp(opt.price)}
                  </div>
                ))}
              </div>
            )}

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
            <div className="summary-row">
              <span>Ongkir</span>
              <span>{selectedShipping ? formatRp(selectedShipping.price) : '—'}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatRp(cartTotal + (selectedShipping?.price || 0))}</span>
            </div>
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
