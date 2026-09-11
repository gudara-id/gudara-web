import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data: categories, error } = await supabase
    .from('product_categories')
    .select('id, slug, name, sort_order')
    .order('sort_order', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Ikut kirim jumlah produk per kategori, supaya UI admin bisa cegah user
  // menghapus kategori yang masih dipakai produk (lihat DELETE di
  // [id]/route.js).
  const { data: counts } = await supabase.from('products').select('category');
  const countMap = {};
  (counts || []).forEach((p) => {
    countMap[p.category] = (countMap[p.category] || 0) + 1;
  });

  return Response.json({
    categories: categories.map((c) => ({ ...c, productCount: countMap[c.slug] || 0 })),
  });
}

export async function POST(req) {
  const { name, slug: slugInput } = await req.json();

  if (!name?.trim()) {
    return Response.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 });
  }
  const slug = slugify(slugInput || name);
  if (!slug) {
    return Response.json({ error: 'Slug tidak valid.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { count } = await supabase
    .from('product_categories')
    .select('id', { count: 'exact', head: true });

  const { data, error } = await supabase
    .from('product_categories')
    .insert({ name: name.trim(), slug, sort_order: (count || 0) + 1 })
    .select()
    .single();

  if (error) {
    // Kode 23505 = unique violation (slug sudah dipakai kategori lain).
    const message = error.code === '23505' ? `Slug "${slug}" sudah dipakai kategori lain.` : error.message;
    return Response.json({ error: message }, { status: 400 });
  }

  return Response.json({ category: data });
}
