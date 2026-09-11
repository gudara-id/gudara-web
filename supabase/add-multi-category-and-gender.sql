-- =====================================================
-- GUDARA — Multi-kategori per produk + filter gender
-- Jalankan ini di: Supabase Dashboard → SQL Editor → New Query
-- (setelah product-categories.sql, sebelum ini dipakai kode)
-- =====================================================
--
-- Sebelum ini: products.category cuma teks tunggal ('daily'|'sport'|'basic'|
-- 'custom'), jadi satu produk cuma bisa masuk 1 kategori. product_categories
-- (dari product-categories.sql) cuma daftar master flat, belum ada relasi
-- many-to-many ke produk dan belum ada grouping induk/anak.
--
-- Migrasi ini ADDITIVE — products.category TIDAK dihapus/diubah, supaya kode
-- lama yang masih baca kolom itu tetap jalan selama masa transisi.

-- ---------- 1. Grouping: kategori bisa punya induk ----------
-- Contoh: "Sport Authentic" (induk) menaungi "Badminton", "Running",
-- "Sepak Bola" (anak). Kategori tanpa induk (parent_slug null) dianggap
-- kategori level atas seperti sebelumnya ('daily', 'sport', 'basic', 'custom').
alter table product_categories
  add column if not exists parent_slug text references product_categories(slug);

-- ---------- 2. Gender ----------
alter table products
  add column if not exists gender text check (gender in ('man', 'woman', 'kids', 'unisex'))
  default 'unisex';

-- ---------- 3. Relasi many-to-many produk <-> kategori ----------
create table if not exists product_category_links (
  product_id  uuid not null references products(id) on delete cascade,
  category_id uuid not null references product_categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create index if not exists idx_category_links_category on product_category_links(category_id);

alter table product_category_links enable row level security;

create policy "anyone can read category links"
  on product_category_links for select
  to anon
  using (true);

-- Tidak ada policy insert/update/delete untuk anon — perubahan link kategori
-- cuma lewat /api/admin/products (service role), sama seperti products lain.

-- ---------- 4. Migrasi data lama ----------
-- Setiap produk yang sudah ada otomatis dapat 1 link sesuai category-nya
-- sekarang, supaya tidak ada produk yang "hilang" dari filter kategori
-- setelah frontend pindah ke junction table.
insert into product_category_links (product_id, category_id)
select p.id, c.id
from products p
join product_categories c on c.slug = p.category
on conflict do nothing;

-- ---------- 5. Seed sub-kategori "Sport Authentic" ----------
insert into product_categories (slug, name, parent_slug, sort_order) values
  ('badminton', 'Badminton', 'sport', 21),
  ('running', 'Running', 'sport', 22),
  ('sepak-bola', 'Sepak Bola', 'sport', 23)
on conflict (slug) do nothing;
