-- =====================================================
-- GUDARA — Hero/Campaign section + storage buckets pendukung
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- Aman dijalankan ulang (semua pakai IF NOT EXISTS / ON CONFLICT).
-- =====================================================

-- ---------- HERO / CAMPAIGN (beranda) ----------
-- Satu baris = satu campaign hero yang sedang tayang di beranda.
-- Admin selalu update baris dengan key = 'home' (bukan bikin baris baru),
-- jadi tabel ini berfungsi sebagai "slot konten" tunggal, bukan daftar.
create table if not exists site_hero (
  id                    uuid primary key default gen_random_uuid(),
  key                   text unique not null default 'home',
  eyebrow               text,
  headline              text not null default 'MOVE FASTER.',
  description           text,
  image_url             text,
  cta_primary_label     text,
  cta_primary_href      text,
  cta_secondary_label   text,
  cta_secondary_href    text,
  updated_at            timestamptz not null default now()
);

-- Baris awal, isinya sama seperti hero statis yang ada sekarang di app/page.js
-- — supaya begitu fitur ini aktif, tampilan beranda tidak berubah dulu
-- sampai admin sengaja menggantinya lewat /admin/campaign.
insert into site_hero (key, eyebrow, headline, description, image_url, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href)
values (
  'home',
  'Move Faster Collection',
  'MOVE FASTER.',
  'Langkah lebih ringan, sirkulasi udara lebih bebas. Tingkatkan outfit-mu bersama GUDARA.',
  '/hero-1.jpg',
  'Belanja Sekarang',
  '/etalase',
  'Mulai Custom Jersey',
  '/custom'
)
on conflict (key) do nothing;

alter table site_hero enable row level security;

drop policy if exists "Public can read hero" on site_hero;
create policy "Public can read hero"
  on site_hero for select
  using (true);

-- Insert/update hanya lewat backend (service role di /api/admin/hero),
-- jadi sengaja tidak dibuatkan policy insert/update publik.

-- ---------- JURNAL (safety net) ----------
-- Tabel ini kemungkinan SUDAH ADA di database kamu (halaman /jurnal sudah
-- jalan). IF NOT EXISTS di sini cuma jaring pengaman kalau ternyata belum
-- ada — tidak akan menyentuh/mengubah tabel yang sudah ada.
create table if not exists journal_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  category      text not null default 'berita',   -- 'berita' | 'event' | 'portofolio'
  excerpt       text,
  content       text,
  cover_image   text,
  event_date    date,
  is_published  boolean not null default true,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create table if not exists journal_images (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references journal_posts(id) on delete cascade,
  url           text not null,
  caption       text,
  sort_order    integer not null default 0
);

alter table journal_posts enable row level security;
alter table journal_images enable row level security;

drop policy if exists "Public can read published journal posts" on journal_posts;
create policy "Public can read published journal posts"
  on journal_posts for select
  using (is_published = true);

drop policy if exists "Public can read journal images" on journal_images;
create policy "Public can read journal images"
  on journal_images for select
  using (true);

-- ---------- STORAGE BUCKETS ----------
-- Bucket baru untuk foto jurnal & materi campaign. Bucket publik (sama
-- seperti 'product-images' yang sudah dipakai), supaya getPublicUrl() dari
-- storage langsung bisa diakses browser tanpa signed URL.
insert into storage.buckets (id, name, public)
values ('journal-images', 'journal-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('site-content', 'site-content', true)
on conflict (id) do nothing;
