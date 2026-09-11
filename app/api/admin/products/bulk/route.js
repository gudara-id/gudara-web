import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Sama seperti helper di [id]/route.js — dipisah di sini karena route ini
// berdiri sendiri (bukan hasil refactor dari file itu, biar tidak perlu
// bikin shared util cuma buat satu fungsi kecil).
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

// Satu endpoint untuk semua aksi massal (dibedakan lewat `action`) supaya
// tombol-tombol di toolbar bulk-select cukup manggil satu route yang sama:
// - delete       : hapus produk + foto di storage sekaligus untuk semua id
// - set_active   : aktif/nonaktifkan banyak produk sekaligus
// - set_category : pindahkan banyak produk ke satu kategori sekaligus
//                  (replace kolom `category` lama + product_category_links)
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
  const action = body.action;

  if (!ids.length) {
    return Response.json({ error: 'Tidak ada produk yang dipilih.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (action === 'delete') {
    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .in('product_id', ids);

    if (images?.length) {
      const paths = images.map((img) => storagePathFromUrl(img.url)).filter(Boolean);
      if (paths.length) {
        await supabase.storage.from('product-images').remove(paths);
      }
    }

    const { error } = await supabase.from('products').delete().in('id', ids);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true, deleted: ids.length });
  }

  if (action === 'set_active') {
    const { error } = await supabase
      .from('products')
      .update({ is_active: body.is_active !== false })
      .in('id', ids);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true, updated: ids.length });
  }

  if (action === 'set_category') {
    const slug = body.category;
    if (!slug) return Response.json({ error: 'Kategori wajib dipilih.' }, { status: 400 });

    const { data: cat, error: catError } = await supabase
      .from('product_categories')
      .select('id, slug')
      .eq('slug', slug)
      .single();
    if (catError || !cat) {
      return Response.json({ error: 'Kategori tidak ditemukan.' }, { status: 400 });
    }

    const { error } = await supabase.from('products').update({ category: cat.slug }).in('id', ids);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Ganti seluruh link kategori produk-produk terpilih jadi kategori ini
    // saja — sama seperti logika single-edit di [id]/route.js, tapi untuk
    // banyak produk sekaligus.
    await supabase.from('product_category_links').delete().in('product_id', ids);
    await supabase
      .from('product_category_links')
      .insert(ids.map((id) => ({ product_id: id, category_id: cat.id })));

    return Response.json({ success: true, updated: ids.length });
  }

  return Response.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
}
