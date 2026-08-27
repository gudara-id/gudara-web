import { createClient } from '@supabase/supabase-js';

// Anon key only — safe to use in both server and client components.
// Public read access to products/variants/images is allowed by the RLS
// policies in supabase/schema.sql. Never put the service_role key here.
//
// Lazy-initialized (sama alasannya dengan lib/supabaseAdmin.js): kalau
// createClient() dipanggil langsung di top-level, Next.js akan
// mengevaluasinya saat build time dan gagal build kalau env var belum
// ke-set di environment tersebut (mis. Preview deployment).
let _supabase = null;

export function getSupabase() {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum di-set di environment ini.'
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}
