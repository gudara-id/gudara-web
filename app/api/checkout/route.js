// app/api/checkout/route.js
import midtransClient from 'midtrans-client';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getShippingRates } from '@/lib/biteship';

function getSnapClient() {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
  });
}

export async function POST(req) {
  try {
    const supabase = getSupabaseAdmin();
    const snap = getSnapClient();
    const body = await req.json();
    const { items, recipient, paymentMethod, shipping } = body;
    // shipping dari client: { courier_company, courier_type } — hasil pilihan user dari /api/shipping/rates

    if (!items?.length) {
      return Response.json({ error: 'Keranjang kosong' }, { status: 400 });
    }
    if (!recipient?.name || !recipient?.phone || !recipient?.address || !recipient?.city || !recipient?.postalCode) {
      return Response.json({ error: 'Data alamat belum lengkap' }, { status: 400 });
    }
    if (!shipping?.courier_company || !shipping?.courier_type) {
      return Response.json({ error: 'Pilih kurir pengiriman dulu' }, { status: 400 });
    }

    // 1. Ambil harga & berat ASLI dari database
    const productIds = [...new Set(items.map((i) => i.id))];
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, weight_grams')
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
        variant_id: null,
        product_name: real.name,
        variant_label: i.variant || null,
        unit_price: real.price,
        qty: i.qty,
        line_total: real.price * i.qty,
        weight_grams: real.weight_grams || 250,
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.line_total, 0);

    // 2. Hitung ulang ongkir di server, cocokkan dengan kurir yang dipilih user
    const biteshipItems = orderItems.map((i) => ({
      name: i.product_name,
      value: i.unit_price,
      weight: i.weight_grams,
      quantity: i.qty,
    }));

    const ratesResult = await getShippingRates({
      destinationPostalCode: recipient.postalCode,
      couriers: shipping.courier_company,
      items: biteshipItems,
    });

    const matchedRate = ratesResult.pricing.find(
      (p) => p.company === shipping.courier_company && p.type === shipping.courier_type
    );
    if (!matchedRate) {
      return Response.json({ error: 'Opsi kurir tidak lagi tersedia, silakan cek ongkir ulang' }, { status: 400 });
    }

    const shippingCost = matchedRate.price;
    const total = subtotal + shippingCost;

    const orderNumber = `GDR-${Date.now()}`;

    // 3. Simpan order dengan status pending_payment
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
        courier_company: shipping.courier_company,
        courier_type: shipping.courier_type,
        courier_service_name: matchedRate.courier_service_name,
      })
      .select()
      .single();
    if (orderError) throw orderError;

    // 4. Simpan item-item order
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));
    if (itemsError) throw itemsError;

    // 5. Minta Midtrans buatkan Snap token
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderNumber,
        gross_amount: total,
      },
      customer_details: {
        first_name: recipient.name,
        phone: recipient.phone,
      },
      item_details: [
        ...orderItems.map((i) => ({
          id: i.product_id,
          price: i.unit_price,
          quantity: i.qty,
          name: i.product_name.substring(0, 50),
        })),
        {
          id: 'ongkir',
          price: shippingCost,
          quantity: 1,
          name: `Ongkir - ${shipping.courier_company.toUpperCase()} ${matchedRate.courier_service_name}`.substring(0, 50),
        },
      ],
    });

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
