import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const VALID_CATEGORIES = ['daily', 'sport', 'basic', 'custom'];

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = (body.name || '').trim();
  const category = body.category;
  const slug = slugify(body.slug || body.name);
  const price = Number(body.price);
  const comparePrice = body.compare_price === '' || body.compare_price == null ? null : Number(body.compare_price);

  if (!name) return Response.json({ error: 'Nama produk wajib diisi.' }, { status: 400 });
  if (!VALID_CATEGORIES.includes(category)) {
    return Response.json({ error: 'Kategori tidak valid.' }, { status: 400 });
  }
  if (!slug) return Response.json({ error: 'Slug wajib diisi (atau nama produk harus menghasilkan slug yang valid).' }, { status: 400 });
  if (!Number.isFinite(price) || price < 0) {
    return Response.json({ error: 'Harga tidak valid.' }, { status: 400 });
  }
  if (comparePrice != null && (!Number.isFinite(comparePrice) || comparePrice < 0)) {
    return Response.json({ error: 'Harga coret tidak valid.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      category,
      description: body.description || null,
      material_spec: body.material_spec || null,
      care_instructions: body.care_instructions || null,
      price,
      compare_price: comparePrice,
      is_active: body.is_active !== false,
    })
    .select('id, slug')
    .single();

  if (error) {
    const msg = error.code === '23505' ? 'Slug ini sudah dipakai produk lain.' : error.message;
    return Response.json({ error: msg }, { status: 500 });
  }

  return Response.json({ success: true, id: data.id, slug: data.slug });
}
