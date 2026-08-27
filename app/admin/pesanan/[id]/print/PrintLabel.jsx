'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { formatRp } from '@/lib/format';

export default function PrintLabel({ order, trackingLink }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (order.waybill_id && barcodeRef.current) {
      JsBarcode(barcodeRef.current, order.waybill_id, {
        format: 'CODE128',
        displayValue: true,
        fontSize: 14,
        height: 50,
        margin: 4,
      });
    }
  }, [order.waybill_id]);

  useEffect(() => {
    // Auto-buka dialog print begitu halaman siap.
    const t = setTimeout(() => window.print(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="label-sheet">
      <div className="label">
        <div className="label__brand">GUDARA</div>

        <div className="label__courier">
          {order.courier_company?.toUpperCase()} — {order.courier_service_name || order.courier_type}
        </div>

        {order.waybill_id ? (
          <svg ref={barcodeRef} className="label__barcode" />
        ) : (
          <p className="label__no-resi">No. Resi belum tersedia</p>
        )}

        <div className="label__section">
          <div className="label__eyebrow">Penerima</div>
          <p className="label__strong">{order.recipient_name}</p>
          <p>{order.recipient_phone}</p>
          <p>{order.shipping_address}, {order.shipping_city} {order.shipping_postal}</p>
        </div>

        <div className="label__section">
          <div className="label__eyebrow">Item</div>
          {order.order_items?.map((it) => (
            <p key={it.id} className="label__item">
              {it.product_name} {it.variant_label ? `(${it.variant_label})` : ''} × {it.qty}
            </p>
          ))}
        </div>

        <div className="label__footer">
          <span>{order.order_number}</span>
          <span>{formatRp(order.total)}</span>
        </div>

        {trackingLink && (
          <p className="label__tracking no-print-line">
            Lacak: {trackingLink}
          </p>
        )}
      </div>

      <button className="btn no-print" onClick={() => window.print()}>
        Cetak Ulang
      </button>
    </div>
  );
}
