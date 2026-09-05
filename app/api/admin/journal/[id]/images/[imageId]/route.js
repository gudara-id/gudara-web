import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(_req, { params }) {
  const { imageId } = await params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('journal_images').delete().eq('id', imageId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
