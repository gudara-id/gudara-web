-- =====================================================
-- GUDARA — Fungsi atomic untuk mengurangi stok varian
-- Jalankan ini di: Supabase Dashboard → SQL Editor → New Query
--
-- Kenapa lewat fungsi SQL, bukan "SELECT stock lalu UPDATE stock - qty"
-- di JavaScript? Karena SELECT-lalu-UPDATE dari luar database ada celah
-- waktu: kalau 2 request datang nyaris bersamaan (mis. race condition di
-- webhook Midtrans), keduanya bisa sama-sama baca stok = 1, sama-sama
-- lolos, dan stok jadi -1 (oversell). Fungsi ini menyatukan cek + kurangi
-- jadi satu operasi atomic di database, jadi tidak mungkin ada celah itu.
-- =====================================================

create or replace function decrement_variant_stock(p_variant_id uuid, p_qty integer)
returns boolean
language plpgsql
as $$
declare
  affected integer;
begin
  update product_variants
  set stock = stock - p_qty
  where id = p_variant_id and stock >= p_qty;

  get diagnostics affected = row_count;
  return affected > 0; -- true kalau stok cukup & berhasil dikurangi, false kalau stok kurang
end;
$$;
