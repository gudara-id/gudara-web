import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import ProductForm from '@/components/ProductForm';
import ProductImages from '@/components/ProductImages';
import ProductVariants from '@/components/ProductVariants';

export const dynamic = 'force-dynamic';

export default async function AdminEditProductPage({ params }) {
  const supabase = getSupabaseAdmin();
  const { id } = await params;

  const { data: product } = await supabase
    .from('products')
    .select(
      '*, product_images(id, url, sort_order, variant_color), product_variants(id, color, size, sku, stock, price_override), product_category_links(product_categories(slug))'
    )
    .eq('id', id)
    .single();

  const { data: categories } = await supabase
    .from('product_categories')
    .select('slug, name, parent_slug')
    .order('sort_order', { ascending: true });

  if (!product) {
    return (
      <section className="wrap admin-shell admin-shell--narrow">
        <Link href="/admin/produk" className="admin-back">&larr; Kembali ke Produk</Link>
        <p>Produk tidak ditemukan.</p>
      </section>
    );
  }

  // Semua slug kategori yang sudah ter-link ke produk ini lewat
  // product_category_links, dipakai supaya checkbox kategori yang sudah
  // dipilih sebelumnya tampil tercentang saat form edit dibuka.
  const categorySlugs = (product.product_category_links || [])
    .map((row) => row.product_categories?.slug)
    .filter(Boolean);

  return (
    <section className="wrap admin-shell admin-shell--narrow">
      <Link href="/admin/produk" className="admin-back">&larr; Kembali ke Produk</Link>

      <div className="admin-head">
        <div>
          <h1>{product.name}</h1>
          <p className="admin-head__meta">/{product.category}/{product.slug}</p>
        </div>
      </div>

      <ProductForm mode="edit" product={{ ...product, categorySlugs }} categories={categories || []} />
      <ProductImages
        productId={product.id}
        images={product.product_images || []}
        colors={[...new Set((product.product_variants || []).map((v) => v.color).filter(Boolean))]}
      />
      <ProductVariants productId={product.id} variants={product.product_variants || []} basePrice={product.price} />
    </section>
  );
}
