import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET = 'product-images';
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

function extOf(filename) {
  const m = /\.([a-z0-9]+)$/i.exec(filename || '');
  return m ? m[1].toLowerCase() : 'jpg';
}

function slugPart(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Nama file di storage MENENTUKAN bagaimana foto ini dikelompokkan di
// halaman produk (lihat lib/products.js — isSizeChartFile / isDesignReferenceFile /
// isCollarOptionFile, semuanya dicek dari nama file, bukan kolom database).
// Jadi upload di sini WAJIB mengikuti pola nama yang sama:
//   gallery      -> nama bebas (asal bukan cocok pola di bawah)
//   size_chart   -> harus mengandung "size-chart"
//   reference    -> harus DIAWALI "referensi"
//   collar       -> harus DIAWALI "kerah-"
function buildFileName(type, originalName, collarLabel) {
  const ext = extOf(originalName);
  const stamp = Date.now();
  if (type === 'size_chart') return `size-chart-${stamp}.${ext}`;
  if (type === 'reference') return `referensi-desain-${stamp}.${ext}`;
  if (type === 'collar') {
    const label = slugPart(collarLabel) || String(stamp);
    return `kerah-${label}.${ext}`;
  }
  const base = slugPart(originalName.replace(/\.[a-z0-9]+$/i, '')) || 'foto';
  return `gallery-${base}-${stamp}.${ext}`;
}

export async function POST(req, { params }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, slug')
    .eq('id', id)
    .single();
  if (productError || !product) {
    return Response.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const type = form?.get('image_type') || 'gallery';
  const collarLabel = form?.get('collar_label') || '';

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'File gambar wajib dipilih.' }, { status: 400 });
  }
  if (!['gallery', 'size_chart', 'reference', 'collar'].includes(type)) {
    return Response.json({ error: 'Jenis foto tidak valid.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'Ukuran file maksimal 8MB.' }, { status: 400 });
  }
  if (!file.type?.startsWith('image/')) {
    return Response.json({ error: 'File harus berupa gambar.' }, { status: 400 });
  }

  const fileName = buildFileName(type, file.name, collarLabel);
  const path = `${product.slug}/${fileName}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return Response.json({ error: `Gagal upload ke storage: ${uploadError.message}` }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { count } = await supabase
    .from('product_images')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id);

  const { data: row, error: insertError } = await supabase
    .from('product_images')
    .insert({ product_id: id, url: pub.publicUrl, sort_order: count || 0 })
    .select('id, url, sort_order')
    .single();

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  return Response.json({ success: true, image: row });
}
