import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const VALID_GENDERS = ['man', 'woman', 'kids', 'unisex'];

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Kategori sekarang dikelola dari tabel product_categories (lihat
// /api/admin/categories), bukan lagi daftar hardcoded — supaya kategori baru
// yang ditambah admin (mis. "Badminton", "Running") langsung valid dipakai
// di sini tanpa perlu ubah kode.
async function fetchValidCategories(supabase, slugs) {
  if (!slugs?.length) return [];
  const { data, error } = await supabase
    .from('product_categories')
    .select('id, slug')
    .in('slug', slugs);
  if (error) return [];
  return data || [];
}

// Simpan set kategori (bisa >1) untuk satu produk: hapus link lama, insert
// yang baru. products.category (kolom lama) ikut diisi kategori pertama yang
// dipilih, supaya breadcrumb/label lama yang masih baca kolom itu tetap benar.
async function syncProductCategories(supabase, productId, categorySlugs) {
  const matched = await fetchValidCategories(supabase, categorySlugs);
  await supabase.from('product_category_links').delete().eq('product_id', productId);
  if (matched.length) {
    await supabase
      .from('product_category_links')
      .insert(matched.map((c) => ({ product_id: productId, category_id: c.id })));
  }
  return matched;
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = (body.name || '').trim();
  // Terima `categories` (array, dari form multi-select baru) atau `category`
  // (string tunggal, untuk kompatibilitas kalau ada pemanggil lama).
  const categorySlugs = Array.isArray(body.categories)
    ? body.categories.filter(Boolean)
    : body.category
    ? [body.category]
    : [];
  const gender = body.gender || 'unisex';
  const slug = slugify(body.slug || body.name);
  const price = Number(body.price);
  const comparePrice = body.compare_price === '' || body.compare_price == null ? null : Number(body.compare_price);

  if (!name) return Response.json({ error: 'Nama produk wajib diisi.' }, { status: 400 });
  if (!slug) return Response.json({ error: 'Slug wajib diisi (atau nama produk harus menghasilkan slug yang valid).' }, { status: 400 });
  if (!Number.isFinite(price) || price < 0) {
    return Response.json({ error: 'Harga tidak valid.' }, { status: 400 });
  }
  if (comparePrice != null && (!Number.isFinite(comparePrice) || comparePrice < 0)) {
    return Response.json({ error: 'Harga coret tidak valid.' }, { status: 400 });
  }
  if (!VALID_GENDERS.includes(gender)) {
    return Response.json({ error: 'Gender tidak valid.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const matchedCategories = await fetchValidCategories(supabase, categorySlugs);
  if (!matchedCategories.length) {
    return Response.json({ error: 'Pilih minimal satu kategori yang valid.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      category: matchedCategories[0].slug, // kolom lama: kategori "utama"
      gender,
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

  await supabase
    .from('product_category_links')
    .insert(matchedCategories.map((c) => ({ product_id: data.id, category_id: c.id })));

  return Response.json({ success: true, id: data.id, slug: data.slug });
}
