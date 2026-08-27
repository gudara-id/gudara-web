import { createClient } from '@supabase/supabase-js';
import { createShippingOrder } from '@/lib/biteship';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req, { params }) {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .single();

  if (error || !order) {
    return Response.json({ error: 'Order tidak ditemukan' }, { status: 404 });
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
      referenceId: `${order.order_number}-retry-${Date.now()}`, // reference_id lama sudah kepakai
      items: order.order_items.map((it) => ({
        name: it.product_name,
        value: it.unit_price,
        weight: it.weight_grams || 250,
        quantity: it.qty,
      })),
    });

    await supabase
      .from('orders')
      .update({
        biteship_order_id: shippingOrder.id,
        waybill_id: shippingOrder.courier.waybill_id,
        shipping_status: shippingOrder.status,
      })
      .eq('id', params.id);

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}