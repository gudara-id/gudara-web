import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET = 'product-images';

function storagePathFromUrl(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = String(url || '').indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(url.slice(idx + marker.length));
  } catch {
    return url.slice(idx + marker.length);
  }
}

export async function DELETE(req, { params }) {
  const { imageId } = await params;
  const supabase = getSupabaseAdmin();

  const { data: image } = await supabase
    .from('product_images')
    .select('url')
    .eq('id', imageId)
    .single();

  const { error } = await supabase.from('product_images').delete().eq('id', imageId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const path = storagePathFromUrl(image?.url);
  if (path) {
    // Kalau hapus di storage gagal, baris database-nya tetap sudah terhapus —
    // tidak dianggap fatal, cukup dicoba saja (best effort).
    await supabase.storage.from(BUCKET).remove([path]);
  }

  return Response.json({ success: true });
}
