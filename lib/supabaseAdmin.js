import { createClient } from '@supabase/supabase-js';

// Service-role client untuk kode server-only (admin routes, webhook, checkout).
// Sengaja dibuat lazy (bukan langsung createClient() di top-level module) —
// kalau dibuat di top-level, Next.js akan mengevaluasinya saat "collecting
// page data" waktu build, dan build akan gagal duluan jika env var belum
// ke-set di environment itu (mis. Preview deployment yang env var-nya belum
// disamakan dengan Production). Dengan lazy init, error soal env var yang
// hilang baru muncul saat route ini benar-benar dipanggil, dengan pesan yang
// jelas — bukan bikin build gagal total.
let _supabaseAdmin = null;

export function getSupabaseAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum di-set di environment ini.'
    );
  }

  _supabaseAdmin = createClient(url, key);
  return _supabaseAdmin;
}
