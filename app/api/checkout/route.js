// app/api/checkout/route.js
// Terima data checkout dari front-end → simpan order (status: pending_payment)
// di Supabase → minta Midtrans buatkan Snap token → kirim token itu balik ke front-end.
//
// Environment variables yang dibutuhkan (isi di .env.local):
//   SUPABASE_URL=
//   SUPABASE_SERVICE_ROLE_KEY=        (JANGAN dipakai di client, hanya di server)
//   MIDTRANS_SERVER_KEY=
//   MIDTRANS_IS_PRODUCTION=false      ('true' kalau sudah live)

import { createClient } from '@supabase/supabase-js';
import midtransClient from 'midtrans-client';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, recipient, paymentMethod } = body;
    // items dari cart-context: [{ id, name, price, image, variant, qty }]

    if (!items?.length) {
      return Response.json({ error: 'Keranjang kosong' }, { status: 400 });
    }
    if (!recipient?.name || !recipient?.phone || !recipient?.address || !recipient?.city || !recipient?.postalCode) {
      return Response.json({ error: 'Data alamat belum lengkap' }, { status: 400 });
    }

    // 1. Ambil harga ASLI dari database — jangan percaya harga yang dikirim
    //    dari client, supaya tidak bisa dimanipulasi lewat devtools.
    const productIds = [...new Set(items.map((i) => i.id))];
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds);
    if (productsError) throw productsError;

    const priceMap = Object.fromEntries(products.map((p) => [p.id, p]));
    const missing = items.find((i) => !priceMap[i.id]);
    if (missing) {
      return Response.json({ error: `Produk tidak ditemukan: ${missing.name}` }, { status: 400 });
    }

    const orderItems = items.map((i) => {
      const real = priceMap[i.id];
      return {
        product_id: i.id,
        variant_id: null, // prototype belum menyimpan variant_id per varian, cuma label ukuran
        product_name: real.name,
        variant_label: i.variant || null,
        unit_price: real.price,
        qty: i.qty,
        line_total: real.price * i.qty,
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.line_total, 0);
    const shippingCost = 0; // ganti dengan hasil hitung ongkir (RajaOngkir/Biteship) kalau sudah siap
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
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));
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
      item_details: orderItems.map((i) => ({
        id: i.product_id,
        price: i.unit_price,
        quantity: i.qty,
        name: i.product_name.substring(0, 50), // Midtrans batasi panjang nama item
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
