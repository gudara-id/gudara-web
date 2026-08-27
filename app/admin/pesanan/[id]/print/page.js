import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getShippingOrder } from '@/lib/biteship';
import PrintLabel from './PrintLabel';

export const dynamic = 'force-dynamic';

export default async function PrintResiPage({ params }) {
  const supabase = getSupabaseAdmin();
  const { id } = await params;
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  if (!order) {
    return (
      <section className="wrap" style={{ padding: '48px 0' }}>
        <p>Order tidak ditemukan.</p>
      </section>
    );
  }

  if (!order.waybill_id) {
    return (
      <section className="wrap" style={{ padding: '48px 0' }}>
        <p>Resi belum dibuat untuk order ini. Buat resi dulu dari halaman detail order.</p>
      </section>
    );
  }

  // Link tracking resmi dari Biteship — best effort, kalau gagal label tetap dicetak tanpa link ini.
  let trackingLink = null;
  if (order.biteship_order_id) {
    try {
      const shippingOrder = await getShippingOrder(order.biteship_order_id);
      trackingLink = shippingOrder?.courier?.link || null;
    } catch {
      // biarkan null, jangan blokir pencetakan resi cuma karena ini gagal
    }
  }

  return <PrintLabel order={order} trackingLink={trackingLink} />;
}
