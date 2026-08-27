import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { formatRp } from '@/lib/format';
import { statusMeta } from '@/lib/orderStatus';
import OrderActions from './OrderActions';
 
export const dynamic = 'force-dynamic';
 
export default async function AdminOrderDetailPage({ params }) {
  const supabase = getSupabaseAdmin();
  const { id } = await params;
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();
 
  if (!order) {
    return (
      <section className="wrap admin-shell admin-shell--narrow">
        <Link href="/admin/pesanan" className="admin-back">&larr; Kembali ke Pesanan</Link>
        <p>Order tidak ditemukan.</p>
      </section>
    );
  }
 
  const meta = statusMeta(order.status);
 
  return (
    <section className="wrap admin-shell admin-shell--narrow">
      <Link href="/admin/pesanan" className="admin-back">&larr; Kembali ke Pesanan</Link>
 
      <div className="admin-head">
        <div>
          <h1>{order.order_number}</h1>
          <p className="admin-head__meta">{new Date(order.created_at).toLocaleString('id-ID')}</p>
        </div>
        <span className="admin-status">
          <span className="admin-status__dot" style={{ background: meta.color }} />
          {meta.label}
        </span>
      </div>
 
      <div className="admin-card">
        <div className="admin-section-label">Penerima</div>
        <p>{order.recipient_name} — {order.recipient_phone}</p>
        <p style={{ color: 'var(--ink-soft)' }}>{order.shipping_address}, {order.shipping_city} {order.shipping_postal}</p>
 
        <div className="admin-section-label">Item</div>
        {order.order_items.map((it) => (
          <div key={it.id} className="admin-line-item">
            <span>{it.product_name} {it.variant_label ? `(${it.variant_label})` : ''} × {it.qty}</span>
            <span>{formatRp(it.line_total)}</span>
          </div>
        ))}
 
        <div className="admin-totals">
          <div className="admin-line-item"><span>Subtotal</span><span>{formatRp(order.subtotal)}</span></div>
          <div className="admin-line-item"><span>Ongkir ({order.courier_company?.toUpperCase()} - {order.courier_service_name})</span><span>{formatRp(order.shipping_cost)}</span></div>
          <div className="admin-line-item admin-line-item--grand"><span>Total</span><span>{formatRp(order.total)}</span></div>
        </div>
      </div>
 
      <div className="admin-card">
        <div className="admin-section-label" style={{ marginTop: 0 }}>Pengiriman</div>
        <p>Status kurir: <strong>{order.shipping_status || '—'}</strong></p>
        <p style={{ marginBottom: order.waybill_id ? 16 : 0 }}>
          No. Resi: <strong>{order.waybill_id || 'Belum ada'}</strong>
        </p>
        {order.waybill_id && (
          <Link
            href={`/admin/pesanan/${order.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
            style={{ color: 'var(--ink)', borderColor: 'var(--ink)' }}
          >
            Cetak Resi
          </Link>
        )}
 
        <OrderActions order={order} />
      </div>
    </section>
  );
}
 
