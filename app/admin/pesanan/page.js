import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { formatRp } from '@/lib/format';
import { statusMeta } from '@/lib/orderStatus';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import AdminNav from '@/components/AdminNav';
 
const TABS = ['paid', 'processing', 'shipped', 'completed', 'pending_payment', 'all'];
 
export const dynamic = 'force-dynamic';
 
export default async function AdminOrdersPage({ searchParams }) {
  const supabase = getSupabaseAdmin();
  const params = await searchParams;
  const filter = params?.status || 'paid';
 
  let query = supabase
    .from('orders')
    .select('id, order_number, recipient_name, total, status, shipping_status, waybill_id, courier_company, created_at')
    .order('created_at', { ascending: false });
 
  if (filter !== 'all') query = query.eq('status', filter);
 
  const { data: orders, error } = await query;
 
  return (
    <section className="wrap admin-shell">
      <AdminNav />
      <div className="admin-head">
        <div>
          <h1>Pesanan</h1>
          <p className="admin-head__meta">{orders?.length || 0} pesanan ditemukan</p>
        </div>
        <AdminLogoutButton />
      </div>
 
      <div className="admin-tabs">
        {TABS.map((s) => (
          <Link
            key={s}
            href={`/admin/pesanan?status=${s}`}
            className={`admin-tab${filter === s ? ' is-active' : ''}`}
          >
            {s === 'all' ? 'Semua' : statusMeta(s).label}
          </Link>
        ))}
      </div>
 
      {error && <p style={{ color: '#C6302B', marginBottom: 16 }}>Gagal memuat data: {error.message}</p>}
 
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>No. Order</th>
              <th>Penerima</th>
              <th>Total</th>
              <th>Status</th>
              <th>Resi</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {(orders || []).map((o) => {
              const meta = statusMeta(o.status);
              return (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/pesanan/${o.id}`}>{o.order_number}</Link>
                  </td>
                  <td>{o.recipient_name}</td>
                  <td>{formatRp(o.total)}</td>
                  <td>
                    <span className="admin-status">
                      <span className="admin-status__dot" style={{ background: meta.color }} />
                      {meta.label}
                    </span>
                  </td>
                  <td>
                    {o.waybill_id ? (
                      <span>{o.courier_company?.toUpperCase()} · {o.waybill_id}</span>
                    ) : o.status === 'paid' ? (
                      <span style={{ color: '#C6302B' }}>Belum ada</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ color: 'var(--ink-soft)' }}>
                    {new Date(o.created_at).toLocaleString('id-ID')}
                  </td>
                </tr>
              );
            })}
            {orders?.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty">Tidak ada pesanan dengan status ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
