import { getSupabase } from './supabase';
 
const PLACEHOLDER_IMAGE = 'https://placehold.co/800x1000/EAE7DF/16181B?font=roboto&text=GUDARA';

// Beberapa produk lama punya baris product_images dengan url kosong/rusak —
// biasanya sisa upload di admin panel yang gagal ke storage tapi baris
// metadatanya kepakai. Saring di sini supaya URL rusak itu tidak pernah
// nyampe ke galeri/thumbnail di frontend (bukan cuma disembunyikan pas render).
function isValidImageUrl(url) {
  return typeof url === 'string' && url.trim().length > 0 && !url.startsWith('blob:');
}

// Bucket 'product-images' di Supabase Storage isinya campur: foto produk asli
// (depan/samping/belakang), tapi juga file pendukung yang KADANG ikut ke-insert
// sebagai baris product_images karena belum ada admin-upload panel — semuanya
// masih ditambahkan manual lewat SQL/Table Editor (lihat folder 'custom' di
// storage: size-chart.jpg, folder "REFERENSI DESAIN", file "MATERI ...",
// file kerah-a.jpg..kerah-l.jpg untuk produk yang punya pilihan kerah).
// Helper-helper di bawah memisahkan baris-baris itu berdasarkan NAMA FILE-nya
// saja (bukan seluruh URL), supaya:
//   1. Dokumen non-foto (pdf/docx/txt materi produk) TIDAK PERNAH nyasar ke
//      galeri foto (ini penyebab "foto ke-3 tidak muncul / blank putih" —
//      galeri coba nampilin file yang bukan gambar).
//   2. size-chart.jpg dipisah ke bagian "Panduan Ukuran", bukan ikut jadi
//      foto galeri.
//   3. Foto di folder "REFERENSI DESAIN" dipisah ke bagian "Referensi Desain".
//   4. Foto kerah-*.jpg dipisah ke bagian "Pilihan Kerah".
// Dicek dari NAMA FILE (bagian setelah "/" terakhir), bukan seluruh path —
// supaya produk yang namanya sendiri mengandung kata itu (mis. slug
// "jaket-kerah-tinggi") tidak salah kesortir cuma karena kata itu nongol di
// nama foldernya.
const IMAGE_EXTENSION_RE = /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i;
const SIZE_CHART_RE = /size[-_ ]?chart/i;
const DESIGN_REFERENCE_RE = /^referensi/i; // cocok dengan folder "REFERENSI DESAIN"
const COLLAR_OPTION_RE = /^kerah[-_ ]?/i; // cocok dengan kerah-a.jpg, kerah-b.jpg, dst.

function fileNameOf(url) {
  const clean = String(url || '').split('?')[0].split('#')[0];
  const raw = clean.split('/').pop() || '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
function isDisplayableImageFile(url) {
  return IMAGE_EXTENSION_RE.test(url);
}
function isSizeChartFile(url) {
  return SIZE_CHART_RE.test(fileNameOf(url));
}
function isDesignReferenceFile(url) {
  return DESIGN_REFERENCE_RE.test(fileNameOf(url));
}
function isCollarOptionFile(url) {
  return COLLAR_OPTION_RE.test(fileNameOf(url));
}
// Ubah "kerah-a.jpg" -> "Kerah A", "kerah-tinggi.jpg" -> "Kerah Tinggi",
// "kerah.jpg" -> "Kerah" — dipakai sebagai label di bawah tiap thumbnail.
function collarOptionLabel(url) {
  const base = fileNameOf(url).replace(/\.[a-z0-9]+$/i, '');
  const suffix = base.replace(/^kerah[-_ ]?/i, '').replace(/[-_]+/g, ' ').trim();
  return suffix ? `Kerah ${suffix.toUpperCase()}` : 'Kerah';
}
// Foto yang boleh masuk galeri utama: harus file gambar beneran, dan bukan
// size-chart / referensi desain / pilihan kerah (semua itu ditampilkan di
// section masing-masing).
function isGalleryPhoto(img) {
  return (
    isValidImageUrl(img.url) &&
    isDisplayableImageFile(img.url) &&
    !isSizeChartFile(img.url) &&
    !isDesignReferenceFile(img.url) &&
    !isCollarOptionFile(img.url)
  );
}

function computeOff(price, comparePrice) {
  if (!comparePrice || comparePrice <= price) return null;
  const pct = Math.round((1 - price / comparePrice) * 100);
  return `${pct}% OFF`;
}

function normalizeCard(p) {
  const images = (p.product_images || [])
    .filter(isGalleryPhoto)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  return {
    id: p.id,
    slug: p.slug,
    kat: p.category,
    name: p.name,
    price: p.price,
    old: p.compare_price,
    off: computeOff(p.price, p.compare_price),
    image: images[0]?.url || PLACEHOLDER_IMAGE,
    // Second image (if uploaded) powers the hover-swap effect on product cards.
    hoverImage: images[1]?.url || null,
  };
}
 
// Mirrors renderProductRow(elId, kat, limit) from the prototype's products.js
export async function getProductRow(kat, limit = 8, sort = 'newest', search = '', opts = {}) {
  const supabase = getSupabase();
  let query = supabase
    .from('products')
    .select('id, slug, name, category, price, compare_price, created_at, product_images(url, sort_order)')
    .eq('is_active', true)
    .limit(limit);
 
  if (kat) query = query.eq('category', kat);
  if (search && search.trim()) query = query.ilike('name', `%${search.trim()}%`);
  // 'custom' kits punya alur belanja sendiri (konsultasi desain via admin,
  // minimum order per desain) — jadi jangan ikut nyampur di feed umum
  // ("Semua Produk" di homepage, hasil search, dst) kecuali memang lagi
  // diminta kategori 'custom' secara eksplisit.
  if (!kat && opts.excludeCustom) query = query.neq('category', 'custom');
 
  // 'price-asc' / 'price-desc' are ordered in JS below since Supabase can't
  // sort by the effective price (price vs compare_price) in one query pass
  // without a generated column; for a catalog this size, sorting the page
  // in memory after fetch is simpler and just as fast.
  if (sort === 'price-asc' || sort === 'price-desc') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }
 
  const { data, error } = await query;
  if (error) {
    console.error('getProductRow failed:', error.message);
    return [];
  }
  const cards = (data || []).map(normalizeCard);
  if (sort === 'price-asc') return cards.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return cards.sort((a, b) => b.price - a.price);
  return cards;
}
 
// Produk terkait untuk section "Kamu Mungkin Juga Suka" di halaman produk —
// ambil beberapa produk lain dari kategori yang sama, kecualikan produk yang
// sedang dilihat.
export async function getRelatedProducts(kat, excludeSlug, limit = 4) {
  const rows = await getProductRow(kat, limit + 1);
  return rows.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}
 
// Mirrors PRODUCTS.find(x => x.id === id) on product.html, but keyed by slug
export async function getProductBySlug(slug) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, slug, name, category, description, material_spec, price, compare_price, product_images(url, sort_order), product_variants(id, color, size, stock)'
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
 
  if (error) {
    console.error('getProductBySlug failed:', error.message);
    return null;
  }
 
  const allImages = (data.product_images || [])
    .filter((img) => isValidImageUrl(img.url))
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  // Pisahkan baris product_images jadi beberapa kelompok berdasarkan nama
  // file (lihat helper isGalleryPhoto/isSizeChartFile/isDesignReferenceFile/
  // isCollarOptionFile di atas): foto galeri asli, panduan ukuran, referensi
  // desain, dan pilihan kerah.
  const galleryImages = allImages.filter(isGalleryPhoto);
  const sizeChartImage = allImages.find((img) => isSizeChartFile(img.url));
  const designReferenceImages = allImages.filter((img) => isDesignReferenceFile(img.url));
  const collarOptionImages = allImages.filter((img) => isCollarOptionFile(img.url));

  const sizes = [...new Set((data.product_variants || []).map((v) => v.size).filter(Boolean))];
  const colors = [...new Set((data.product_variants || []).map((v) => v.color).filter(Boolean))];
  const imageUrls = galleryImages.length ? galleryImages.map((i) => i.url) : [PLACEHOLDER_IMAGE];
 
  return {
    id: data.id,
    slug: data.slug,
    kat: data.category,
    name: data.name,
    description: data.description || null,
    materialSpec: data.material_spec,
    price: data.price,
    old: data.compare_price,
    off: computeOff(data.price, data.compare_price),
    image: imageUrls[0],
    // Full ordered gallery — the PDP shows a thumbnail rail when a product
    // has more than one image, and falls back to a single-image view when
    // it doesn't (most products only have one placeholder for now).
    // Sudah dibersihkan dari size-chart, foto referensi desain, & pilihan
    // kerah — itu ditampilkan di section terpisah masing-masing.
    images: imageUrls,
    sizeChartUrl: sizeChartImage?.url || null,
    designReferences: designReferenceImages.map((i) => i.url),
    collarOptions: collarOptionImages.map((i) => ({ url: i.url, label: collarOptionLabel(i.url) })),
    // Fall back to the prototype's static S/M/L/XL when a product has no
    // variants seeded yet (seed.sql only seeds variants for basic-tee-man).
    sizes: sizes.length ? sizes : ['S', 'M', 'L', 'XL'],
    colors,
  };
}
