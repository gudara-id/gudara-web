import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(req, { params }) {
  const { variantId } = await params;
  const body = await req.json().catch(() => ({}));

  const stock = Number(body.stock ?? 0);
  if (!Number.isFinite(stock) || stock < 0) {
    return Response.json({ error: 'Stok tidak valid.' }, { status: 400 });
  }
  const priceOverride = body.price_override === '' || body.price_override == null ? null : Number(body.price_override);
  if (priceOverride != null && (!Number.isFinite(priceOverride) || priceOverride < 0)) {
    return Response.json({ error: 'Harga override tidak valid.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('product_variants')
    .update({
      color: body.color || null,
      size: body.size || null,
      sku: body.sku || null,
      stock,
      price_override: priceOverride,
    })
    .eq('id', variantId);

  if (error) {
    const msg = error.code === '23505' ? 'SKU ini sudah dipakai.' : error.message;
    return Response.json({ error: msg }, { status: 500 });
  }

  return Response.json({ success: true });
}

export async function DELETE(req, { params }) {
  const { variantId } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
