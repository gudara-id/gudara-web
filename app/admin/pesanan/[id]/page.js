import { createClient } from '@supabase/supabase-js';
import { formatRp } from '@/lib/format';
import OrderActions from './OrderActions';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({ params }) {
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .single();

  if (!order) {
    return (
      <section className="wrap" style={{ padding: '48px 0' }}>
        <p>Order tidak ditemukan.</p>
      </section>
    );
  }

  return (
    <section className="wrap" style={{ padding: '48px 0 96px', maxWidth: 720 }}>
      <h1 style={{ marginBottom: 8 }}>{order.order_number}</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 32 }}>
        {new Date(order.created_at).toLocaleString('id-ID')}
      </p>

      <div className="eyebrow" style={{ marginBottom: 8 }}>Penerima</div>
      <p>{order.recipient_name} — {order.recipient_phone}</p>
      <p>{order.shipping_address}, {order.shipping_city} {order.shipping_postal}</p>

      <div className="eyebrow" style={{ margin: '24px 0 8px' }}>Item</div>
      {order.order_items.map((it) => (
        <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0' }}>
          <span>{it.product_name} {it.variant_label ? `(${it.variant_label})` : ''} × {it.qty}</span>
          <span>{formatRp(it.line_total)}</span>
        </div>
      ))}

      <div style={{ marginTop: 16, borderTop: '1px solid #ddd', paddingTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{formatRp(order.subtotal)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ongkir ({order.courier_company?.toUpperCase()} - {order.courier_service_name})</span><span>{formatRp(order.shipping_cost)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Total</span><span>{formatRp(order.total)}</span></div>
      </div>

      <div className="eyebrow" style={{ margin: '24px 0 8px' }}>Pengiriman</div>
      <p>Status pembayaran: <strong>{order.status}</strong></p>
      <p>Status kurir: <strong>{order.shipping_status || '—'}</strong></p>
      <p>No. Resi: <strong>{order.waybill_id || 'Belum ada'}</strong></p>

      <OrderActions order={order} />
    </section>
  );
}
