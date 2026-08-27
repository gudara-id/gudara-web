'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderActions({ order }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(false);

  async function updateStatus(status) {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgOk(false);
        setMsg(data.error || `Gagal update status (${res.status}).`);
        return;
      }
      router.refresh();
    } catch (err) {
      setMsgOk(false);
      setMsg('Gagal menghubungi server. Cek koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  async function retryShipping() {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/retry-shipping`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgOk(false);
        setMsg(data.error || `Gagal membuat resi (${res.status}).`);
        return;
      }
      setMsgOk(true);
      setMsg('Resi berhasil dibuat.');
      router.refresh();
    } catch (err) {
      setMsgOk(false);
      setMsg('Gagal menghubungi server. Cek koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-actions">
      {order.status === 'paid' && (
        <button className="btn btn--dark" disabled={loading} onClick={() => updateStatus('processing')}>
          Tandai Diproses
        </button>
      )}
      {order.status === 'processing' && (
        <button className="btn btn--dark" disabled={loading} onClick={() => updateStatus('shipped')}>
          Tandai Dikirim
        </button>
      )}
      {order.status === 'shipped' && (
        <button className="btn btn--dark" disabled={loading} onClick={() => updateStatus('completed')}>
          Tandai Selesai
        </button>
      )}
      {(!order.waybill_id || order.shipping_status === 'failed_to_create') && order.status !== 'pending_payment' && (
        <button className="btn btn--outline" style={{ color: 'var(--ink)', borderColor: 'var(--ink)' }} disabled={loading} onClick={retryShipping}>
          {loading ? 'Memproses...' : 'Coba Buat Resi Lagi'}
        </button>
      )}
      {order.status !== 'cancelled' && order.status !== 'completed' && (
        <button className="btn btn--outline" disabled={loading} onClick={() => updateStatus('cancelled')} style={{ color: '#C6302B', borderColor: '#C6302B' }}>
          Batalkan Order
        </button>
      )}
      {msg && <p className="admin-msg" style={{ color: msgOk ? '#16A34A' : '#C6302B' }}>{msg}</p>}
    </div>
  );
}
