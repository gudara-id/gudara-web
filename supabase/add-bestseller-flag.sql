-- =====================================================
-- GUDARA — Tandai produk sebagai Bestseller (kurasi manual)
-- Jalankan SEKALI di Supabase Dashboard → SQL Editor.
--
-- Kenapa manual, bukan dihitung otomatis dari penjualan: website belum
-- live/dipakai transaksi nyata, jadi order_items belum punya data yang bisa
-- dipercaya buat menentukan "produk terlaris". Kolom ini biar admin bisa
-- menandai produk yang memang laris di kanal lain (TikTok Shop/Shopee) atau
-- yang ingin didorong, lewat checkbox di /admin/produk/[id] atau aksi massal
-- di /admin/produk. Nanti kalau order_items sudah punya data penjualan yang
-- cukup, kolom ini bisa diganti jadi hasil query agregat — lihat catatan di
-- lib/products.js (getBestsellers).
-- =====================================================

alter table products
  add column if not exists is_bestseller boolean not null default false;

create index if not exists products_is_bestseller_idx on products(is_bestseller) where is_bestseller = true;
