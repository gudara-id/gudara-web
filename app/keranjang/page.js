'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatRp } from '@/lib/format';
import { CHECKOUT_ENABLED, buildWhatsAppOrderUrl } from '@/lib/checkout';

export default function KeranjangPage() {
  const { cart, cartTotal, updateQty, removeLine } = useCart();

  return (
    <section className="wrap" style={{ padding: '56px 0 96px' }}>
      <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', marginBottom: 32 }}>Keranjang Kamu</h1>
      <div className="checkout-grid">
        <div>
          {cart.length === 0 ? (
            <div className="empty-cart" style={{ textAlign: 'left' }}>
              Keranjangmu masih kosong.{' '}
              <Link href="/etalase" style={{ textDecoration: 'underline' }}>Mulai belanja &rarr;</Link>
            </div>
          ) : (
            cart.map((i) => (
              <div className="cart-line" style={{ alignItems: 'center' }} key={`${i.id}-${i.variant}`}>
                <img src={i.image} style={{ width: 80, height: 100 }} alt={i.name} />
                <div className="cart-line__info">
                  <div className="cart-line__name" style={{ fontSize: 15 }}>{i.name}</div>
                  <div className="eyebrow">{i.variant || ''}</div>
                  <div className="cart-line__row">
                    <div className="qty-ctrl">
                      <button onClick={() => updateQty(i.id, i.variant, -1)}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => updateQty(i.id, i.variant, 1)}>+</button>
                    </div>
                    <span className="price">{formatRp(i.price * i.qty)}</span>
                  </div>
                  <button className="remove-line" onClick={() => removeLine(i.id, i.variant)}>Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="summary-box">
          <div className="summary-row"><span>Subtotal</span><span className="price">{formatRp(cartTotal)}</span></div>
          <div className="summary-row"><span>Ongkir</span><span style={{ color: 'var(--ink-soft)' }}>{CHECKOUT_ENABLED ? 'Dihitung saat checkout' : 'Dikonfirmasi admin via WhatsApp'}</span></div>
          <div className="summary-row total"><span>Total</span><span>{formatRp(cartTotal)}</span></div>
          {CHECKOUT_ENABLED ? (
            <Link href="/checkout" className="btn btn--dark" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>Lanjut ke Checkout</Link>
          ) : (
            <a
              href={buildWhatsAppOrderUrl(cart, cartTotal)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--dark"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
            >
              Pesan via WhatsApp
            </a>
          )}
          <Link href="/etalase" className="btn btn--outline" style={{ width: '100%', justifyContent: 'center', marginTop: 10, color: 'var(--ink)', borderColor: 'var(--ink)' }}>Lanjut Belanja</Link>
        </div>
      </div>
    </section>
  );
}
