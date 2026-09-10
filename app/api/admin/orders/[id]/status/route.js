import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { sendOrderStatusUpdate } from '@/lib/whatsapp';
import { sendOrderStatusEmail } from '@/lib/email';

const VALID_STATUSES = ['processing', 'shipped', 'completed', 'cancelled'];

export async function POST(req, { params }) {
  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: 'Status tidak valid' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: order, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('order_number, recipient_name, recipient_phone, waybill_id, customers(email)')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Notifikasi tidak boleh menggagalkan update status kalau gagal kirim —
  // WA & email masing-masing dibungkus try/catch sendiri, dan error-nya
  // cuma di-log, tidak mempengaruhi response ke admin panel.
  try {
    await sendOrderStatusUpdate({
      phone: order.recipient_phone,
      customerName: order.recipient_name,
      orderNumber: order.order_number,
      status,
      extra: status === 'shipped' ? order.waybill_id : undefined,
    });
  } catch (waErr) {
    console.error('Gagal kirim WA update status pesanan:', waErr.message);
  }

  try {
    await sendOrderStatusEmail({
      to: order.customers?.email,
      customerName: order.recipient_name,
      orderNumber: order.order_number,
      status,
      waybill: order.waybill_id,
    });
  } catch (emailErr) {
    console.error('Gagal kirim email update status pesanan:', emailErr.message);
  }

  return Response.json({ success: true });
}
