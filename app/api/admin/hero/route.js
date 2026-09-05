import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(req) {
  const body = await req.json().catch(() => ({}));
  const headline = (body.headline || '').trim();

  if (!headline) return Response.json({ error: 'Headline wajib diisi.' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('site_hero')
    .update({
      eyebrow: body.eyebrow || null,
      headline,
      description: body.description || null,
      cta_primary_label: body.cta_primary_label || null,
      cta_primary_href: body.cta_primary_href || null,
      cta_secondary_label: body.cta_secondary_label || null,
      cta_secondary_href: body.cta_secondary_href || null,
      updated_at: new Date().toISOString(),
    })
    .eq('key', 'home');

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
