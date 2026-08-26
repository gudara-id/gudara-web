# GUDARA Web (Next.js)

Hasil konversi prototype HTML statis (`Gudara Website/`) menjadi Next.js App
Router project, sesuai Tahap 2 di `SETUP_GUIDE.md`. Produk sekarang diambil
dari Supabase, bukan dari `products.js` statis.

## Menjalankan lokal

1. Salin `.env.local.example` → `.env.local`, isi dengan Project URL & anon key
   dari Supabase project kamu (lihat Tahap 0 & 1 di SETUP_GUIDE.md).
2. `npm install`
3. `npm run dev`

## Struktur

- `app/page.js` — Beranda (dari `index.html`)
- `app/etalase/page.js` — Katalog produk, filter `?kat=` (dari `etalase.html`)
- `app/produk/[slug]/page.js` — Detail produk (dari `product.html`), slug dari kolom `slug` di tabel `products`
- `app/keranjang/page.js` — Keranjang (dari `cart.html`)
- `app/checkout/page.js` — Checkout (dari `checkout.html`) — pembayaran Midtrans sungguhan menyusul di Tahap 3
- `app/custom/page.js` — Custom kits (dari `custom.html`, statis)
- `components/` — Header, Footer, CartDrawer, ProductCard/Grid (dari `partials.js` + `products.js`)
- `lib/cart-context.jsx` — cart engine berbasis React Context + localStorage (pengganti `app.js`)
- `lib/products.js` — query Supabase untuk produk (pengganti data statis `products.js`)
- `lib/supabase.js` — Supabase client (anon key)
- `supabase/schema.sql`, `supabase/seed.sql` — dibawa dari prototype untuk Tahap 1
- `api-examples/` — route Midtrans untuk Tahap 3, belum dipasang di `app/api/`

## Catatan penyesuaian dari prototype

- Field produk sekarang datang dari Supabase (`slug`, `category`, `price`,
  `compare_price`, `material_spec`, `product_variants`, `product_images`),
  bukan dari objek statis di `products.js` lama.
- Halaman produk memakai ukuran dari `product_variants` kalau sudah ada
  datanya; kalau belum (seed.sql baru mengisi varian utk `basic-tee-man`),
  fallback ke S/M/L/XL seperti prototype.
- Tombol "Cari" di header lama mengarah ke `#searchOverlay` yang sebenarnya
  tidak pernah dibuat elemennya di prototype — jadi belum dipindahkan ke sini.
  Bisa ditambahkan nanti sebagai fitur baru kalau dibutuhkan.
- Checkout masih pakai alert placeholder yang sama seperti prototype — koneksi
  ke Midtrans dipasang di Tahap 3.

  
