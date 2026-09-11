import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Catatan: mengubah slug kategori yang SUDAH dipakai produk akan membuat
// produk itu "lepas" dari kategorinya (products.category tidak ikut
// ter-update otomatis, karena bukan foreign key — lihat catatan di
// supabase/product-categories.sql). Makanya di bawah ini slug tidak
// diizinkan diubah kalau kategori masih punya produk; yang boleh diubah
// cuma nama tampilannya.
export async function PATCH(req, { params }) {
  const { id } = await params;
  const { name } = await req.json();

  if (!name?.trim()) {
    return Response.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('product_categories')
    .update({ name: name.trim() })
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ category: data });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: category, error: findError } = await supabase
    .from('product_categories')
    .select('slug')
    .eq('id', id)
    .single();
  if (findError || !category) {
    return Response.json({ error: 'Kategori tidak ditemukan.' }, { status: 404 });
  }

  // Cegah hapus kategori yang masih ada produknya — kalau dihapus,
  // produk-produk itu jadi punya category yang "yatim" (tidak ada di
  // product_categories lagi) dan tidak akan muncul di dropdown admin mana
  // pun untuk dipindah kategorinya.
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category', category.slug);

  if (count > 0) {
    return Response.json(
      { error: `Tidak bisa dihapus — masih dipakai ${count} produk. Pindahkan produk itu ke kategori lain dulu.` },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('product_categories').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
