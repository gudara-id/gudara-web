// app/api/midtrans-webhook/route.js
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createShippingOrder } from '@/lib/biteship';
import { sendOrderConfirmation } from '@/lib/whatsapp';
import { formatRp } from '@/lib/format';

// Signature Midtrans = SHA512(order_id + status_code + gross_amount + ServerKey).
// Ini membuktikan notifikasi benar-benar datang dari Midtrans (bukan orang
// yang kirim POST palsu ke endpoint ini untuk pura-pura order sudah dibayar).
// Ref: https://docs.midtrans.com/docs/https-notification-webhooks
function isValidSignature(notification) {
  const { order_id, status_code, gross_amount, signature_key } = notification;
  if (!order_id || !status_code || !gross_amount || !signature_key) return false;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const expected = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex');

  // timingSafeEqual butuh panjang buffer yang sama, sekaligus mencegah
  // timing attack dibanding pakai `===` biasa.
  const expectedBuf = Buffer.from(expected, 'hex');
  const receivedBuf = Buffer.from(String(signature_key), 'hex');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

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
  if (!isValidSignature(notification)) {
    console.error('Midtrans webhook: signature tidak valid, request ditolak.', {
      order_id: notification?.order_id,
    });
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

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

  // Kurangi stok varian di sini (saat pembayaran BENAR-BENAR terkonfirmasi),
  // bukan saat checkout — supaya keranjang yang ditinggal / belum dibayar
  // tidak mengunci stok orang lain. decrement_variant_stock() adalah fungsi
  // SQL atomic (update ... where stock >= qty), jadi aman dari race condition
  // kalau ada 2 pembayaran nyaris bersamaan untuk stok terakhir.
  // order.waybill_id di atas juga menjaga ini cuma jalan sekali per order.
  const itemsWithVariant = (order.order_items || []).filter((it) => it.variant_id);
  for (const it of itemsWithVariant) {
    const { data: ok, error: rpcError } = await supabase.rpc('decrement_variant_stock', {
      p_variant_id: it.variant_id,
      p_qty: it.qty,
    });
    if (rpcError) {
      console.error('Gagal mengurangi stok (RPC error):', it.variant_id, rpcError.message);
    } else if (!ok) {
      // Stok sudah tidak cukup (kemungkinan oversell / race condition langka).
      // Order tetap diproses karena uang sudah diterima — perlu dicek manual.
      console.error(
        `Stok tidak cukup saat konfirmasi pembayaran (order ${orderNumber}): variant_id=${it.variant_id}, qty=${it.qty}. Cek manual.`
      );
    }
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

  // Kirim WA konfirmasi ke pembeli. Dibungkus try/catch sendiri dan tidak
  // mempengaruhi response webhook — kalau WhatsApp API gagal/kredensial
  // belum diisi, order tetap sudah "paid" dan resi tetap sudah dibuat di atas;
  // ini murni notifikasi tambahan, bukan langkah yang boleh menggagalkan alur.
  try {
    await sendOrderConfirmation({
      phone: order.recipient_phone,
      customerName: order.recipient_name,
      orderNumber: order.order_number,
      totalFormatted: formatRp(order.total),
    });
  } catch (waErr) {
    console.error('Gagal kirim WA konfirmasi pesanan:', waErr.message);
  }

  return Response.json({ received: true });
}
