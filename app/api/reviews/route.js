import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Review cuma bisa dikirim oleh pembeli yang order-nya sudah "completed" dan
// memang berisi produk yang mau direview — dicek pakai nomor pesanan +
// 9 digit terakhir nomor HP (biar user tidak perlu login untuk review).
export async function POST(req) {
  const { productId, orderNumber, phone, reviewerName, rating, comment } = await req.json();

  if (!productId || !orderNumber || !phone || !reviewerName || !rating) {
    return Response.json({ error: 'Mohon lengkapi semua data.' }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return Response.json({ error: 'Rating tidak valid.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, recipient_phone, status, order_items(product_id)')
    .eq('order_number', orderNumber.trim())
    .single();

  if (orderError || !order) {
    return Response.json({ error: 'Nomor pesanan tidak ditemukan.' }, { status: 404 });
  }

  const normalizedInput = String(phone).replace(/\D/g, '').slice(-9);
  const normalizedOrder = String(order.recipient_phone).replace(/\D/g, '').slice(-9);
  if (!normalizedInput || normalizedInput !== normalizedOrder) {
    return Response.json({ error: 'Nomor HP tidak cocok dengan pesanan ini.' }, { status: 403 });
  }
  if (order.status !== 'completed') {
    return Response.json(
      { error: 'Review hanya bisa dikirim untuk pesanan yang statusnya sudah Selesai.' },
      { status: 403 }
    );
  }
  const boughtThisProduct = (order.order_items || []).some((it) => it.product_id === productId);
  if (!boughtThisProduct) {
    return Response.json({ error: 'Produk ini tidak ditemukan di pesanan tersebut.' }, { status: 403 });
  }

  const { error: insertError } = await supabase.from('product_reviews').insert({
    product_id: productId,
    order_id: order.id,
    reviewer_name: reviewerName.trim(),
    rating,
    comment: comment?.trim() || null,
    status: 'pending',
  });

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
