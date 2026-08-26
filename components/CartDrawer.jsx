'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatRp } from '@/lib/format';

export default function CartDrawer() {
  const { cart, cartTotal, drawerOpen, closeDrawer, updateQty, removeLine } = useCart();

  return (
    <>
      <div
        className={`overlay${drawerOpen ? ' open' : ''}`}
        onClick={closeDrawer}
      />
      <aside className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="drawer__head">
          <strong style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase' }}>
            Keranjang
          </strong>
          <button onClick={closeDrawer} style={{ fontSize: 20 }}>&times;</button>
        </div>
        <div className="drawer__items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              Keranjangmu masih kosong.
              <br />
              Yuk mulai belanja.
            </div>
          ) : (
            cart.map((i) => (
              <div className="cart-line" key={`${i.id}-${i.variant}`}>
                <img src={i.image} alt={i.name} />
                <div className="cart-line__info">
                  <div className="cart-line__name">{i.name}</div>
                  <div className="eyebrow">{i.variant || ''}</div>
                  <div className="cart-line__row">
                    <div className="qty-ctrl">
                      <button onClick={() => updateQty(i.id, i.variant, -1)}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => updateQty(i.id, i.variant, 1)}>+</button>
                    </div>
                    <span className="price">{formatRp(i.price * i.qty)}</span>
                  </div>
                  <button className="remove-line" onClick={() => removeLine(i.id, i.variant)}>
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="drawer__foot">
          <div className="drawer__subtotal">
            <span>Subtotal</span>
            <span>{formatRp(cartTotal)}</span>
          </div>
          <Link href="/checkout" className="btn btn--dark" style={{ width: '100%', justifyContent: 'center' }} onClick={closeDrawer}>
            Checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
