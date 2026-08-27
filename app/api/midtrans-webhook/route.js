// app/api/midtrans-webhook/route.js
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createShippingOrder } from '@/lib/biteship';

// Beberapa alat (termasuk tombol "Tes URL notifikasi" di dashboard Midtrans)
// mengecek keterjangkauan URL dengan request GET/HEAD sebelum mengirim POST
// sungguhan. Tanpa handler ini, Next.js otomatis membalas 405 dan test
// tersebut akan gagal walau endpoint POST-nya sendiri baik-baik saja.
export async function GET() {
  return Response.json({ ok: true });
}

export async function POST(request) {
  const supabase = getSupabaseAdmin();
  let notification;
  try {
    notification = await request.json();
  } catch {
    // Body kosong/bukan JSON (mis. dari test konektivitas) — jangan anggap error server.
    return Response.json({ received: true });
  }
  // TODO: verifikasi signature_key Midtrans di sini sebelum lanjut

  const orderNumber = notification?.order_id; // ini order_number/midtrans_order_id, bukan uuid id
  const status = notification?.transaction_status;

  if (!orderNumber || (status !== "settlement" && status !== "capture")) {
    return Response.json({ received: true });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .single();

  if (error || !order) {
    return Response.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  if (order.waybill_id) {
    // resi sudah dibuat sebelumnya, hindari duplikat
    return Response.json({ received: true });
  }

  try {
    const shippingOrder = await createShippingOrder({
      destination: {
        contact_name: order.recipient_name,
        contact_phone: order.recipient_phone,
        address: `${order.shipping_address}, ${order.shipping_city}`,
        postal_code: order.shipping_postal,
      },
      courierCompany: order.courier_company,
      courierType: order.courier_type,
      referenceId: order.order_number,
      items: order.order_items.map((it) => ({
        name: it.product_name,
        value: it.unit_price,
        weight: it.weight_grams || 250,
        quantity: it.qty,
      })),
    });

    await supabase
      .from("orders")
      .update({
        biteship_order_id: shippingOrder.id,
        waybill_id: shippingOrder.courier.waybill_id,
        shipping_status: shippingOrder.status,
        status: "paid",
        midtrans_status: status,
        paid_at: new Date().toISOString(),
      })
      .eq("order_number", orderNumber);
  } catch (shippingErr) {
    await supabase
      .from("orders")
      .update({
        status: "paid",
        midtrans_status: status,
        paid_at: new Date().toISOString(),
        shipping_status: "failed_to_create",
      })
      .eq("order_number", orderNumber);
    console.error("Gagal buat resi:", shippingErr.message);
  }

  return Response.json({ received: true });
}
