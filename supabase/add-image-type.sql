-- =====================================================
-- GUDARA — Pisahkan foto gallery vs size-chart vs referensi desain
-- Jalankan SEKALI di Supabase Dashboard → SQL Editor.
--
-- Kenapa ini perlu: sekarang semua baris di product_images dianggap foto
-- gallery, jadi kalau size-chart.jpg atau foto dari folder "REFERENSI
-- DESIGN" ikut di-insert ke tabel ini, dia ikut muncul di galeri utama
-- produk (nomor 2 & 3 di daftar masalah). Kolom image_type di bawah
-- memisahkan ketiganya di level data, supaya kodenya (lib/products.js)
-- bisa query masing-masing secara terpisah.
-- =====================================================

alter table product_images
  add column if not exists image_type text not null default 'gallery';

alter table product_images
  add constraint product_images_image_type_check
  check (image_type in ('gallery', 'size_chart', 'reference'));

-- ---------------------------------------------------------
-- Backfill baris yang SUDAH ADA: tandai ulang baris yang url-nya kebetulan
-- nunjuk ke size-chart / folder referensi desain. Sesuaikan pola ILIKE ini
-- kalau nama file/foldernya beda dari yang di storage kamu.
-- ---------------------------------------------------------
update product_images
set image_type = 'size_chart'
where url ilike '%size-chart%' or url ilike '%size_chart%' or url ilike '%sizechart%';

update product_images
set image_type = 'reference'
where url ilike '%referensi%design%' or url ilike '%reference%design%' or url ilike '%REFERENSI%';

-- Cek hasilnya sebelum lanjut:
-- select image_type, url from product_images order by image_type;

-- ---------------------------------------------------------
-- Cara pakai ke depannya (karena belum ada form admin untuk upload foto):
-- setiap kali insert baris baru ke product_images secara manual lewat
-- SQL Editor atau Table Editor, isi image_type sesuai jenis fotonya:
--   'gallery'     -> foto produk biasa (depan, belakang, samping, dst.)
--   'size_chart'  -> SATU foto tabel ukuran, muncul di "Panduan Ukuran"
--   'reference'   -> foto referensi desain, muncul di bawah info produk
-- Contoh:
--   insert into product_images (product_id, url, sort_order, image_type)
--   values ('<uuid-produk>', '<public-url-storage>', 0, 'size_chart');
-- ---------------------------------------------------------
