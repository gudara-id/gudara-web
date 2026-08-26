import { createClient } from '@supabase/supabase-js';

// Anon key only — safe to use in both server and client components.
// Public read access to products/variants/images is allowed by the RLS
// policies in supabase/schema.sql. Never put the service_role key here.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
