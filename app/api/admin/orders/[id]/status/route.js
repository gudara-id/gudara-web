import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const VALID_STATUSES = ['processing', 'shipped', 'completed', 'cancelled'];

export async function POST(req, { params }) {
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: 'Status tidak valid' }, { status: 400 });
  }

  const { error } = await supabase.from('orders').update({ status }).eq('id', params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}