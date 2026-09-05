import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const VALID_CATEGORIES = ['berita', 'event', 'portofolio'];

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

  const title = (body.title || '').trim();
  const category = body.category;
  const slug = slugify(body.slug || body.title);

  if (!title) return Response.json({ error: 'Judul wajib diisi.' }, { status: 400 });
  if (!VALID_CATEGORIES.includes(category)) {
    return Response.json({ error: 'Kategori tidak valid.' }, { status: 400 });
  }
  if (!slug) return Response.json({ error: 'Slug wajib diisi.' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('journal_posts')
    .update({
      title,
      slug,
      category,
      excerpt: body.excerpt || null,
      content: body.content || null,
      event_date: body.event_date || null,
      is_published: body.is_published !== false,
    })
    .eq('id', id);

  if (error) {
    const msg = error.code === '23505' ? 'Slug ini sudah dipakai postingan lain.' : error.message;
    return Response.json({ error: msg }, { status: 500 });
  }

  return Response.json({ success: true });
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('journal_posts').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
