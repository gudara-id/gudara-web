-- =====================================================
-- GUDARA — Perbaiki URL gambar produk yang masih placeholder rusak
-- Jalankan SEKALI di Supabase SQL Editor (project yang sudah live/sudah di-seed).
--
-- Ini beda dari seed.sql: seed.sql cuma untuk instalasi baru dari nol
-- (akan error kalau dijalankan ulang di database yang sudah terisi, karena
-- kolom slug unique). Script ini aman dijalankan berkali-kali — dia cuma
-- meng-update kolom url di product_images yang sudah ada.
--
-- Setelah foto asli produk sudah di-upload ke Supabase Storage, jalankan
-- UPDATE serupa lagi dengan url storage yang sebenarnya untuk produk
-- terkait (bisa satu-satu per slug, tidak perlu semuanya sekaligus).
-- =====================================================

update product_images pi
set url = 'https://placehold.co/800x1000/EAE7DF/16181B?font=roboto&text=' || replace(p.name, ' ', '+')
from products p
where pi.product_id = p.id;
