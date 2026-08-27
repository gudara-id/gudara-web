'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderActions({ order }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function updateStatus(status) {
    setLoading(true);
    setMsg('');
    const res = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setMsg(data.error || 'Gagal update status.');
      return;
    }
    router.refresh();
  }

  async function retryShipping() {
    setLoading(true);
    setMsg('');
    const res = await fetch(`/api/admin/orders/${order.id}/retry-shipping`, { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || 'Gagal membuat resi.');
      return;
    }
    setMsg('Resi berhasil dibuat.');
    router.refresh();
  }

  return (
    <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {order.status === 'paid' && (
        <button className="btn btn--accent" disabled={loading} onClick={() => updateStatus('processing')}>
          Tandai Diproses
        </button>
      )}
      {order.status === 'processing' && (
        <button className="btn btn--accent" disabled={loading} onClick={() => updateStatus('shipped')}>
          Tandai Dikirim
        </button>
      )}
      {order.status === 'shipped' && (
        <button className="btn btn--accent" disabled={loading} onClick={() => updateStatus('completed')}>
          Tandai Selesai
        </button>
      )}
      {(!order.waybill_id || order.shipping_status === 'failed_to_create') && order.status !== 'pending_payment' && (
        <button className="btn" disabled={loading} onClick={retryShipping}>
          {loading ? 'Memproses...' : 'Coba Buat Resi Lagi'}
        </button>
      )}
      {order.status !== 'cancelled' && order.status !== 'completed' && (
        <button className="btn" disabled={loading} onClick={() => updateStatus('cancelled')} style={{ color: '#C6302B' }}>
          Batalkan Order
        </button>
      )}
      {msg && <p style={{ width: '100%', fontSize: 13, marginTop: 8 }}>{msg}</p>}
    </div>
  );
}
