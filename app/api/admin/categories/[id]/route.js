import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Catatan: mengubah slug kategori yang SUDAH dipakai produk akan membuat
// produk itu "lepas" dari kategorinya (products.category tidak ikut
// ter-update otomatis, karena bukan foreign key — lihat catatan di
// supabase/product-categories.sql). Makanya di bawah ini slug tidak
// diizinkan diubah kalau kategori masih punya produk; yang boleh diubah
// cuma nama tampilannya.
export async function PATCH(req, { params }) {
  const { id } = await params;
  const { name, parent_slug: parentSlug } = await req.json();

  if (!name?.trim()) {
    return Response.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const update = { name: name.trim() };
  // parent_slug ikut diupdate hanya kalau dikirim eksplisit di body — supaya
  // request lama yang cuma kirim {name} tidak sengaja menghapus grouping
  // yang sudah diset sebelumnya.
  if (parentSlug !== undefined) update.parent_slug = parentSlug || null;

  const { data, error } = await supabase
    .from('product_categories')
    .update(update)
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

  // Cegah hapus kategori yang masih ada produknya (dicek dari
  // product_category_links, bukan cuma products.category lama) — kalau
  // dihapus, produk-produk itu jadi kehilangan link ke kategori ini dan
  // tidak akan muncul di dropdown admin mana pun untuk dipindah kategorinya.
  const { count } = await supabase
    .from('product_category_links')
    .select('product_id', { count: 'exact', head: true })
    .eq('category_id', id);

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
