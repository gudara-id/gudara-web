import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getShippingOrder } from '@/lib/biteship';

// Samakan format nomor HP (08xx / +628xx / 628xx) supaya bisa dibandingkan —
// ambil 9 digit terakhir sebagai kunci pencocokan.
function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.slice(-9);
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Permintaan tidak valid' }, { status: 400 });
  }

  const orderNumber = String(body?.orderNumber || '').trim();
  const phone = String(body?.phone || '').trim();

  if (!orderNumber || !phone) {
    return Response.json({ error: 'Nomor pesanan dan No. HP wajib diisi' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .ilike('order_number', orderNumber)
    .single();

  if (error || !order) {
    return Response.json({ error: 'Nomor pesanan tidak ditemukan. Cek kembali penulisannya.' }, { status: 404 });
  }

  if (normalizePhone(order.recipient_phone) !== normalizePhone(phone)) {
    return Response.json(
      { error: 'No. HP tidak cocok dengan nomor pesanan ini. Gunakan No. HP yang dipakai saat checkout.' },
      { status: 403 }
    );
  }

  // Coba ambil link tracking resmi dari kurir (live) — kalau gagal/tidak ada, tetap tampilkan
  // data yang sudah tersimpan supaya halaman tidak error hanya karena Biteship lagi lambat.
  let courierLink = null;
  let courierHistory = null;
  if (order.biteship_order_id) {
    try {
      const shippingOrder = await getShippingOrder(order.biteship_order_id);
      courierLink = shippingOrder?.courier?.link || null;
      courierHistory = shippingOrder?.history || null;
    } catch (err) {
      console.error('Gagal ambil status live Biteship:', err.message);
    }
  }

  return Response.json({
    orderNumber: order.order_number,
    status: order.status,
    createdAt: order.created_at,
    paidAt: order.paid_at,
    recipientName: order.recipient_name,
    shippingCity: order.shipping_city,
    courierCompany: order.courier_company,
    courierServiceName: order.courier_service_name,
    waybillId: order.waybill_id,
    shippingStatus: order.shipping_status,
    courierLink,
    courierHistory,
    items: order.order_items.map((it) => ({
      name: it.product_name,
      variant: it.variant_label,
      qty: it.qty,
      lineTotal: it.line_total,
    })),
    subtotal: order.subtotal,
    shippingCost: order.shipping_cost,
    total: order.total,
  });
}
