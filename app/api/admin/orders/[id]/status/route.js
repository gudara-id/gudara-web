import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const VALID_STATUSES = ['processing', 'shipped', 'completed', 'cancelled'];

export async function POST(req, { params }) {
  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: 'Status tidak valid' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}