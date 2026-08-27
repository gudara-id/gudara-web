import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { formatRp } from '@/lib/format';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const STATUS_LABEL = {
  pending_payment: 'Menunggu Bayar',
  paid: 'Sudah Dibayar',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
};

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({ searchParams }) {
  const filter = searchParams?.status || 'paid';

  let query = supabase
    .from('orders')
    .select('id, order_number, recipient_name, total, status, shipping_status, waybill_id, courier_company, created_at')
    .order('created_at', { ascending: false });

  if (filter !== 'all') query = query.eq('status', filter);

  const { data: orders, error } = await query;

  return (
    <section className="wrap" style={{ padding: '48px 0 96px' }}>
      <h1 style={{ marginBottom: 24 }}>Pesanan</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['paid', 'processing', 'shipped', 'completed', 'pending_payment', 'all'].map((s) => (
          <Link
            key={s}
            href={`/admin/pesanan?status=${s}`}
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: 13,
              background: filter === s ? '#000' : 'transparent',
              color: filter === s ? '#fff' : '#000',
            }}
          >
            {s === 'all' ? 'Semua' : STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {error && <p style={{ color: '#C6302B' }}>Gagal memuat data: {error.message}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '8px 4px' }}>No. Order</th>
            <th style={{ padding: '8px 4px' }}>Penerima</th>
            <th style={{ padding: '8px 4px' }}>Total</th>
            <th style={{ padding: '8px 4px' }}>Status</th>
            <th style={{ padding: '8px 4px' }}>Resi</th>
            <th style={{ padding: '8px 4px' }}>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {(orders || []).map((o) => (
            <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px 4px' }}>
                <Link href={`/admin/pesanan/${o.id}`} style={{ fontWeight: 600 }}>
                  {o.order_number}
                </Link>
              </td>
              <td style={{ padding: '8px 4px' }}>{o.recipient_name}</td>
              <td style={{ padding: '8px 4px' }}>{formatRp(o.total)}</td>
              <td style={{ padding: '8px 4px' }}>{STATUS_LABEL[o.status] || o.status}</td>
              <td style={{ padding: '8px 4px' }}>
                {o.waybill_id ? (
                  <span>{o.courier_company?.toUpperCase()} · {o.waybill_id}</span>
                ) : o.status === 'paid' ? (
                  <span style={{ color: '#C6302B' }}>Belum ada</span>
                ) : (
                  '—'
                )}
              </td>
              <td style={{ padding: '8px 4px' }}>
                {new Date(o.created_at).toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
          {orders?.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: '24px 4px', color: 'var(--ink-soft)' }}>
                Tidak ada pesanan dengan status ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}