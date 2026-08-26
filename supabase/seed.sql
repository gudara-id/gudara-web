-- =====================================================
-- GUDARA — Seed data (contoh migrasi dari products.js)
-- Jalankan SETELAH schema.sql
-- =====================================================

insert into products (slug, name, category, material_spec, price, compare_price) values
('fantasy-negara', 'Jersey Fantasy Negara', 'daily', 'Dry Fit Milano — menyerap keringat instan, sirkulasi udara maksimal.', 90000, 150000),
('embos-kerah-rib', 'Jersey Embos Kerah Rib', 'daily', 'Dry Fit Embos.', 65000, 85000),
('oversized-champion', 'Oversized Champion', 'daily', 'Dry Fit Benzema — quick-dry, breathable, anti UV & anti bakteri.', 80000, 135000),
('oversized-refind-power', 'Oversized Refind Power', 'daily', 'Dry Fit Benzema.', 80000, 135000),
('oversized-retro', 'Oversized Retro', 'daily', 'Dry Fit Benzema.', 85000, 135000),
('setelan-anak', 'Embos Variasi Setelan Anak 4-12th', 'daily', 'Dry Fit Embos.', 49500, 80000),

('celana-authentic', 'Celana Pendek Authentic', 'sport', 'Dry Fit Benzema & Jala.', 60000, 100000),
('army-hitam', 'Running Army Hitam', 'sport', 'Dry Fit Polyester.', 75000, 100000),
('army-muda', 'Running Army Muda', 'sport', 'Dry Fit Polyester.', 75000, 100000),
('terrain-blue', 'Terrain Blue', 'sport', 'Dry Fit Polyester.', 75000, 100000),
('terrain-black', 'Terrain Black', 'sport', 'Dry Fit Polyester.', 75000, 100000),
('vortex-green', 'Vortex Green', 'sport', 'Dry Fit Polyester.', 75000, 100000),
('vortex-blue', 'Vortex Blue', 'sport', 'Dry Fit Polyester.', 75000, 100000),
('blaze', 'Blaze', 'sport', 'Dry Fit Polyester.', 75000, 100000),
('nature', 'Nature', 'sport', 'Dry Fit Polyester.', 75000, 100000),

('basic-tee-man', 'Basic Tee Man', 'basic', 'Dry Fit Waffle Mini.', 50000, 85000),
('basic-tee-woman', 'Basic Tee Woman', 'basic', 'Dry Fit Waffle Mini.', 45000, 85000);

-- Contoh varian untuk satu produk (ulangi pola ini untuk produk lain)
insert into product_variants (product_id, color, size, sku, stock)
select id, 'Hitam', size, slug || '-hitam-' || size, 20
from products, unnest(array['S','M','L','XL']) as size
where slug = 'basic-tee-man';

insert into product_variants (product_id, color, size, sku, stock)
select id, 'Putih', size, slug || '-putih-' || size, 20
from products, unnest(array['S','M','L','XL']) as size
where slug = 'basic-tee-man';

-- Gambar produk — untuk sekarang pakai placeholder bermerek (warna brand +
-- nama produk) supaya tampilan tidak "pecah" selama foto asli belum di-upload.
-- Nanti kalau foto asli sudah ada di Supabase Storage, ganti baris ini jadi
-- URL storage-nya masing-masing (lihat supabase/update-product-images.sql
-- untuk cara update tanpa perlu re-seed dari nol).
insert into product_images (product_id, url, sort_order)
select id, 'https://placehold.co/800x1000/EAE7DF/16181B?font=roboto&text=' || replace(name, ' ', '+'), 0
from products;
