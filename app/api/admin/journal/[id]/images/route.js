import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET = 'journal-images';
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

function extOf(filename) {
  const m = /\.([a-z0-9]+)$/i.exec(filename || '');
  return m ? m[1].toLowerCase() : 'jpg';
}

export async function POST(req, { params }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: post, error: postError } = await supabase
    .from('journal_posts')
    .select('id, slug')
    .eq('id', id)
    .single();
  if (postError || !post) {
    return Response.json({ error: 'Postingan tidak ditemukan.' }, { status: 404 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const type = form?.get('image_type') || 'gallery'; // 'cover' | 'gallery'
  const caption = form?.get('caption') || '';

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'File gambar wajib dipilih.' }, { status: 400 });
  }
  if (!['cover', 'gallery'].includes(type)) {
    return Response.json({ error: 'Jenis foto tidak valid.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'Ukuran file maksimal 8MB.' }, { status: 400 });
  }
  if (!file.type?.startsWith('image/')) {
    return Response.json({ error: 'File harus berupa gambar.' }, { status: 400 });
  }

  const stamp = Date.now();
  const fileName = `${type}-${stamp}.${extOf(file.name)}`;
  const path = `${post.slug}/${fileName}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return Response.json({ error: `Gagal upload ke storage: ${uploadError.message}` }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  if (type === 'cover') {
    const { error: updateError } = await supabase
      .from('journal_posts')
      .update({ cover_image: pub.publicUrl })
      .eq('id', id);
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    return Response.json({ success: true, url: pub.publicUrl });
  }

  const { count } = await supabase
    .from('journal_images')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', id);

  const { data: row, error: insertError } = await supabase
    .from('journal_images')
    .insert({ post_id: id, url: pub.publicUrl, caption: caption || null, sort_order: count || 0 })
    .select('id, url, caption, sort_order')
    .single();

  if (insertError) return Response.json({ error: insertError.message }, { status: 500 });

  return Response.json({ success: true, image: row });
}
