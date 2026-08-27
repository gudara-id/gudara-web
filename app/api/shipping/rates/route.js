// app/api/shipping/rates/route.js
import { createClient } from "@supabase/supabase-js";
import { getShippingRates } from "@/lib/biteship";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { destinationPostalCode, items } = await request.json();
    // items dari cart: [{ id, qty }]

    if (!destinationPostalCode || !items?.length) {
      return Response.json(
        { error: "destinationPostalCode dan items wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil berat & harga ASLI dari database — jangan percaya data dari client
    const productIds = [...new Set(items.map((i) => i.id))];
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, weight_grams")
      .in("id", productIds);
    if (error) throw error;

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const biteshipItems = items.map((i) => {
      const p = productMap[i.id];
      if (!p) throw new Error(`Produk tidak ditemukan: ${i.id}`);
      return {
        name: p.name,
        value: p.price,
        weight: p.weight_grams || 250,
        quantity: i.qty,
      };
    });

    const data = await getShippingRates({
      destinationPostalCode,
      items: biteshipItems,
    });

    const options = data.pricing.map((p) => ({
      courier_company: p.company,
      courier_name: p.courier_name,
      courier_service_name: p.courier_service_name,
      courier_type: p.type,
      duration: p.duration,
      price: p.price,
    }));

    return Response.json({ options });
  } catch (err) {
    console.error("Rates error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
