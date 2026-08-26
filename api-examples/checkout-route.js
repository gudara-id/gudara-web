// app/api/checkout/route.js
// Next.js 13+ App Router API route.
// Tujuan: terima data checkout dari front-end → simpan order (status: pending_payment)
// di Supabase → minta Midtrans buatkan Snap token → kirim token itu balik ke front-end.
//
// Environment variables yang dibutuhkan (isi di .env.local):
//   SUPABASE_URL=
//   SUPABASE_SERVICE_ROLE_KEY=        (JANGAN dipakai di client, hanya di server)
//   MIDTRANS_SERVER_KEY=
//   MIDTRANS_IS_PRODUCTION=false      ('true' kalau sudah live)

import { createClient } from '@supabase/supabase-js';
import midtransClient from 'midtrans-client';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, recipient, paymentMethod } = body;
    // items: [{ productId, variantId, name, variantLabel, price, qty }]
    // recipient: { name, phone, address, city, postalCode }

    if (!items?.length) {
      return Response.json({ error: 'Keranjang kosong' }, { status: 400 });
    }

    // 1. Hitung ulang total di server — JANGAN percaya harga yang dikirim dari client.
    //    Di produksi, ambil harga asli dari tabel `products`/`product_variants`
    //    berdasarkan productId, bukan dari body request.
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shippingCost = 0; // ganti dengan hasil hitung ongkir (RajaOngkir/Biteship)
    const total = subtotal + shippingCost;

    const orderNumber = `GDR-${Date.now()}`;

    // 2. Simpan order dengan status pending_payment
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        status: 'pending_payment',
        subtotal,
        shipping_cost: shippingCost,
        total,
        recipient_name: recipient.name,
        recipient_phone: recipient.phone,
        shipping_address: recipient.address,
        shipping_city: recipient.city,
        shipping_postal: recipient.postalCode,
        payment_method: paymentMethod,
        midtrans_order_id: orderNumber,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Simpan item-item order
    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      variant_id: i.variantId,
      product_name: i.name,
      variant_label: i.variantLabel,
      unit_price: i.price,
      qty: i.qty,
      line_total: i.price * i.qty,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // 4. Minta Midtrans buatkan Snap token
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderNumber,
        gross_amount: total,
      },
      customer_details: {
        first_name: recipient.name,
        phone: recipient.phone,
      },
      item_details: items.map((i) => ({
        id: i.productId,
        price: i.price,
        quantity: i.qty,
        name: i.name.substring(0, 50), // Midtrans batasi panjang nama item
      })),
    });

    // 5. Kirim token ke front-end untuk membuka Snap popup
    return Response.json({
      orderNumber,
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return Response.json({ error: 'Gagal membuat transaksi' }, { status: 500 });
  }
}
