import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const VALID_CATEGORIES = ['daily', 'sport', 'basic', 'custom'];

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function PATCH(req, { params }) {
  const { id } = await params;
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
  if (!slug) return Response.json({ error: 'Slug wajib diisi.' }, { status: 400 });
  if (!Number.isFinite(price) || price < 0) {
    return Response.json({ error: 'Harga tidak valid.' }, { status: 400 });
  }
  if (comparePrice != null && (!Number.isFinite(comparePrice) || comparePrice < 0)) {
    return Response.json({ error: 'Harga coret tidak valid.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('products')
    .update({
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
    .eq('id', id);

  if (error) {
    const msg = error.code === '23505' ? 'Slug ini sudah dipakai produk lain.' : error.message;
    return Response.json({ error: msg }, { status: 500 });
  }

  return Response.json({ success: true, slug });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  // Foto di Supabase Storage tidak otomatis kehapus oleh cascade delete di
  // database (cascade cuma menghapus baris product_images-nya), jadi hapus
  // dulu object di storage sebelum menghapus produknya.
  const { data: images } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', id);

  if (images?.length) {
    const paths = images.map((img) => storagePathFromUrl(img.url)).filter(Boolean);
    if (paths.length) {
      await supabase.storage.from('product-images').remove(paths);
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}

function storagePathFromUrl(url) {
  const marker = '/storage/v1/object/public/product-images/';
  const idx = String(url || '').indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(url.slice(idx + marker.length));
  } catch {
    return url.slice(idx + marker.length);
  }
}
