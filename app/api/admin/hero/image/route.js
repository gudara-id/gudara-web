import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET = 'site-content';
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

function extOf(filename) {
  const m = /\.([a-z0-9]+)$/i.exec(filename || '');
  return m ? m[1].toLowerCase() : 'jpg';
}

export async function POST(req) {
  const supabase = getSupabaseAdmin();

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'File gambar wajib dipilih.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'Ukuran file maksimal 8MB.' }, { status: 400 });
  }
  if (!file.type?.startsWith('image/')) {
    return Response.json({ error: 'File harus berupa gambar.' }, { status: 400 });
  }

  const path = `hero/home-${Date.now()}.${extOf(file.name)}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return Response.json({ error: `Gagal upload ke storage: ${uploadError.message}` }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { error: updateError } = await supabase
    .from('site_hero')
    .update({ image_url: pub.publicUrl, updated_at: new Date().toISOString() })
    .eq('key', 'home');

  if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

  return Response.json({ success: true, url: pub.publicUrl });
}
