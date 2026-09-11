-- Sebelum ini, kategori produk cuma teks bebas ('daily' | 'sport' | 'basic' |
-- 'custom') yang di-hardcode di beberapa tempat di kode (dropdown admin,
-- tab filter admin, filter pill di etalase). Tabel ini bikin kategori jadi
-- data yang bisa dikelola dari admin, tanpa perlu ubah kode tiap kali mau
-- tambah kategori baru.
--
-- products.category TETAP kolom teks seperti sebelumnya (tidak diubah jadi
-- foreign key) supaya tidak perlu migrasi data yang berisiko — categories.slug
-- di tabel ini harus dijaga tetap konsisten dengan nilai yang dipakai di
-- products.category lewat aplikasi (lihat app/api/admin/categories).
create table if not exists product_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,   -- dipakai sebagai nilai products.category & ?kat= di URL
  name        text not null,          -- label yang ditampilkan ke user, mis. "Daily & Casual"
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Seed 4 kategori yang sudah ada di kode sebelum fitur ini dibuat, supaya
-- produk yang sudah ada tidak "kehilangan" nama kategorinya di tampilan.
insert into product_categories (slug, name, sort_order) values
  ('daily', 'Daily & Casual', 1),
  ('sport', 'Sport Authentic', 2),
  ('basic', 'Basic', 3),
  ('custom', 'Custom Kits', 4)
on conflict (slug) do nothing;

alter table product_categories enable row level security;

-- Publik boleh baca (dipakai buat render filter pill di etalase) — tapi
-- tidak ada policy insert/update/delete untuk anon, jadi tambah/edit/hapus
-- kategori cuma bisa lewat /api/admin/categories (service role).
create policy "anyone can read categories"
  on product_categories for select
  to anon
  using (true);
