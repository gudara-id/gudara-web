-- Tracking sederhana untuk section "Kamu Mungkin Juga Suka" di halaman produk,
-- supaya bisa dicek: berapa kali tiap produk terkait dilihat, diklik, dan
-- berapa yang berujung add-to-cart dari section itu (bukan dari halaman
-- produknya sendiri).
create table if not exists product_events (
  id                 uuid primary key default gen_random_uuid(),
  event_type         text not null check (event_type in ('related_view','related_click','related_add_to_cart')),
  source_product_id  uuid references products(id) on delete cascade, -- produk yang sedang dilihat
  target_product_id  uuid references products(id) on delete cascade, -- produk terkait yang ditampilkan/diklik
  session_id         text,
  created_at         timestamptz not null default now()
);

create index if not exists product_events_target_idx on product_events(target_product_id);
create index if not exists product_events_created_idx on product_events(created_at);

alter table product_events enable row level security;

-- Anon key (dipakai di browser) cuma boleh INSERT, tidak boleh baca balik —
-- laporan performanya dibaca lewat SQL Editor / service role di admin, bukan
-- dari frontend publik.
create policy "anon can insert product events"
  on product_events for insert
  to anon
  with check (true);

-- Query contoh untuk lihat performa tiap produk sebagai target related:
-- select target_product_id,
--   count(*) filter (where event_type = 'related_view') as views,
--   count(*) filter (where event_type = 'related_click') as clicks,
--   count(*) filter (where event_type = 'related_add_to_cart') as add_to_cart
-- from product_events
-- group by target_product_id
-- order by add_to_cart desc;
