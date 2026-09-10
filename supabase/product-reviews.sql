create table if not exists product_reviews (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products(id) on delete cascade,
  order_id       uuid references orders(id) on delete set null, -- bukti pembelian
  reviewer_name  text not null,
  rating         smallint not null check (rating between 1 and 5),
  comment        text,
  status         text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at     timestamptz not null default now()
);

create index if not exists product_reviews_product_idx on product_reviews(product_id) where status = 'approved';

alter table product_reviews enable row level security;

-- Publik (anon key) cuma boleh baca review yang sudah di-approve admin.
create policy "anyone can read approved reviews"
  on product_reviews for select
  to anon
  using (status = 'approved');

-- Tidak ada policy INSERT untuk anon secara sengaja — submit review
-- dilakukan lewat /api/reviews (pakai service role) supaya bisa divalidasi
-- dulu: order_id valid, nomor HP cocok, status pesanan "completed", dan
-- produknya memang ada di pesanan itu. Lihat app/api/reviews/route.js.

-- Approve/reject review dilakukan admin lewat SQL Editor untuk sekarang:
--   update product_reviews set status = 'approved' where id = '...';
-- (Bisa dipindah ke UI admin panel kalau volume review-nya sudah banyak.)
