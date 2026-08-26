-- =====================================================
-- GUDARA — Database Schema (Supabase / PostgreSQL)
-- Jalankan ini di: Supabase Dashboard → SQL Editor → New Query
-- =====================================================

-- ---------- PRODUCTS ----------
create table products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,          -- dipakai di URL, mis. "terrain-blue"
  name          text not null,
  category      text not null,                 -- 'daily' | 'sport' | 'basic'
  description   text,
  material_spec text,
  price         integer not null,              -- harga jual, dalam Rupiah (bukan sen)
  compare_price integer,                        -- harga coret (opsional)
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Varian produk (warna/ukuran) — satu produk bisa punya banyak varian
create table product_variants (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  color         text,
  size          text,                           -- 'S','M','L','XL','XXL', dst
  sku           text unique,
  stock         integer not null default 0,
  price_override integer                        -- kalau varian ini beda harga, opsional
);

-- Gambar produk (banyak foto per produk)
create table product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  url           text not null,
  sort_order    integer not null default 0
);

-- ---------- CUSTOMERS ----------
create table customers (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid references auth.users(id),  -- diisi kalau pakai Supabase Auth
  full_name     text,
  phone         text,
  email         text,
  created_at    timestamptz not null default now()
);

create table customer_addresses (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references customers(id) on delete cascade,
  label         text,                            -- "Rumah", "Kantor", dst
  recipient     text not null,
  phone         text not null,
  full_address  text not null,
  city          text not null,
  postal_code   text not null,
  is_default    boolean not null default false
);

-- ---------- ORDERS ----------
create table orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text unique not null,        -- mis. "GDR-20260824-0001"
  customer_id       uuid references customers(id),
  status            text not null default 'pending_payment',
  -- status: pending_payment | paid | processing | shipped | completed | cancelled | expired

  subtotal          integer not null,
  shipping_cost     integer not null default 0,
  total             integer not null,

  recipient_name    text not null,
  recipient_phone   text not null,
  shipping_address  text not null,
  shipping_city     text not null,
  shipping_postal   text not null,

  payment_method    text,                        -- 'qris' | 'va' | 'ewallet' | 'cc'
  midtrans_order_id text unique,                  -- ID yang dikirim ke Midtrans
  midtrans_status   text,                         -- raw status dari Midtrans webhook

  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);

create table order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    uuid references products(id),
  variant_id    uuid references product_variants(id),
  product_name  text not null,       -- disalin saat order dibuat (histori harga aman walau produk berubah)
  variant_label text,
  unit_price    integer not null,
  qty           integer not null,
  line_total    integer not null
);

-- ---------- INDEXES ----------
create index idx_products_category on products(category);
create index idx_variants_product on product_variants(product_id);
create index idx_orders_customer on orders(customer_id);
create index idx_orders_midtrans on orders(midtrans_order_id);

-- ---------- ROW LEVEL SECURITY (aktifkan sebelum production) ----------
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Produk boleh dibaca publik (buat catalog), tapi hanya bisa diubah lewat service role (backend)
create policy "Public can read active products"
  on products for select
  using (is_active = true);

create policy "Public can read variants"
  on product_variants for select
  using (true);

create policy "Public can read product images"
  on product_images for select
  using (true);

-- Orders: pelanggan hanya boleh lihat order miliknya sendiri (kalau pakai Supabase Auth)
create policy "Customers can view own orders"
  on orders for select
  using (customer_id in (
    select id from customers where auth_user_id = auth.uid()
  ));

-- Insert order dilakukan lewat backend (service role key), bukan langsung dari browser,
-- supaya harga & stok tidak bisa dimanipulasi dari client. Jangan buat policy insert publik.
