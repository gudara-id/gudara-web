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
    .select('*, product_images(id, url, sort_order), product_variants(id, color, size, sku, stock, price_override)')
    .eq('id', id)
    .single();

  if (!product) {
    return (
      <section className="wrap admin-shell admin-shell--narrow">
        <Link href="/admin/produk" className="admin-back">&larr; Kembali ke Produk</Link>
        <p>Produk tidak ditemukan.</p>
      </section>
    );
  }

  return (
    <section className="wrap admin-shell admin-shell--narrow">
      <Link href="/admin/produk" className="admin-back">&larr; Kembali ke Produk</Link>

      <div className="admin-head">
        <div>
          <h1>{product.name}</h1>
          <p className="admin-head__meta">/{product.category}/{product.slug}</p>
        </div>
      </div>

      <ProductForm mode="edit" product={product} />
      <ProductImages productId={product.id} images={product.product_images || []} />
      <ProductVariants productId={product.id} variants={product.product_variants || []} basePrice={product.price} />
    </section>
  );
}
