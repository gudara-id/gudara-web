-- =====================================================
-- GUDARA — Foto galeri per varian warna
-- Jalankan SEKALI di Supabase Dashboard → SQL Editor.
--
-- Kenapa ini perlu: sekarang satu produk cuma punya SATU galeri foto yang
-- sama, dipakai buat semua warna (mis. produk "Jersey Fantasy Negara" yang
-- punya varian Argentina/Brazil/England/dst tetap menampilkan foto yang
-- sama walau pembeli klik warna berbeda). Kolom variant_color di bawah
-- menandai sebuah foto galeri itu punya warna apa, supaya halaman produk
-- bisa filter galeri sesuai warna yang lagi dipilih.
--
-- Foto yang variant_color-nya NULL/kosong dianggap "umum" — tetap
-- ditampilkan untuk warna manapun yang belum ada foto khusus.
-- =====================================================

alter table product_images
  add column if not exists variant_color text;

create index if not exists idx_product_images_variant_color
  on product_images(product_id, variant_color);

-- Cara pakai ke depannya: dari halaman admin edit produk, saat upload foto
-- "Foto Galeri", isi field "Untuk Varian Warna" dengan salah satu warna
-- yang sudah ada di daftar Varian produk itu (mis. "Brazil"). Kosongkan
-- kalau foto itu berlaku untuk semua warna / produk tidak punya varian warna.
