// app/api/webhooks/midtrans/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createShippingOrder } from "@/lib/biteship";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role, bukan anon key
);

export async function POST(request) {
  const notification = await request.json();
  // TODO: verifikasi signature_key Midtrans di sini sebelum lanjut

  const orderId = notification.order_id;
  const status = notification.transaction_status;

  if (status !== "settlement" && status !== "capture") {
    return NextResponse.json({ received: true });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  if (order.waybill_id) {
    // resi sudah dibuat sebelumnya, hindari duplikat
    return NextResponse.json({ received: true });
  }

  try {
    const shippingOrder = await createShippingOrder({
      destination: {
        contact_name: order.destination_contact_name,
        contact_phone: order.destination_contact_phone,
        address: order.destination_address,
        postal_code: order.destination_postal_code,
      },
      courierCompany: order.courier_company,
      courierType: order.courier_type,
      referenceId: order.id,
      items: order.order_items.map((it) => ({
        name: it.product_name,
        value: it.price,
        weight: it.weight || 250,
        quantity: it.quantity,
      })),
    });

    await supabase
      .from("orders")
      .update({
        biteship_order_id: shippingOrder.id,
        waybill_id: shippingOrder.courier.waybill_id,
        shipping_status: shippingOrder.status,
        status: "paid",
      })
      .eq("id", orderId);
  } catch (shippingErr) {
    // Pembayaran tetap dicatat sukses walau resi gagal dibuat —
    // catat error-nya biar bisa di-retry manual dari admin
    await supabase
      .from("orders")
      .update({ status: "paid", shipping_status: "failed_to_create" })
      .eq("id", orderId);
    console.error("Gagal buat resi:", shippingErr.message);
  }

  return NextResponse.json({ received: true });
}
