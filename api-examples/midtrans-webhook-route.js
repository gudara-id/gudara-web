// app/api/midtrans-webhook/route.js
// Midtrans akan memanggil endpoint ini otomatis setiap kali status pembayaran
// berubah (pending → settlement/capture, expire, cancel, dsb).
//
// PENTING — daftarkan URL endpoint ini di:
//   Midtrans Dashboard → Settings → Configuration → Payment Notification URL
//   Contoh: https://gudara.id/api/midtrans-webhook
//
// Environment variables tambahan:
//   MIDTRANS_SERVER_KEY=   (dipakai lagi di sini untuk verifikasi signature)

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.json();
  const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;

  // 1. WAJIB verifikasi signature — supaya orang lain tidak bisa memalsukan
  //    notifikasi "pembayaran sukses" langsung ke endpoint ini.
  const expectedSignature = crypto
    .createHash('sha512')
    .update(order_id + status_code + gross_amount + process.env.MIDTRANS_SERVER_KEY)
    .digest('hex');

  if (signature_key !== expectedSignature) {
    return Response.json({ error: 'Invalid signature' }, { status: 403 });
  }

  // 2. Tentukan status order berdasarkan status dari Midtrans
  let newStatus = 'pending_payment';
  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    newStatus = 'paid';
  } else if (transaction_status === 'expire') {
    newStatus = 'expired';
  } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
    newStatus = 'cancelled';
  }

  // 3. Update order di database
  const { error } = await supabase
    .from('orders')
    .update({
      status: newStatus,
      midtrans_status: transaction_status,
      paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
    })
    .eq('midtrans_order_id', order_id);

  if (error) {
    console.error('Webhook update error:', error);
    return Response.json({ error: 'Gagal update order' }, { status: 500 });
  }

  // 4. (Opsional) kirim notifikasi WhatsApp/email ke admin & pelanggan di sini
  //    saat newStatus === 'paid'.

  return Response.json({ received: true });
}
