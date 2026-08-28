export const dynamic = 'force-dynamic';
 
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { formatRp, titleCase, toFeatureList } from '@/lib/format';
import AddToCartSection from '@/components/AddToCartSection';
import ProductGallery from '@/components/ProductGallery';
import ProductAccordion from '@/components/ProductAccordion';
import ProductGrid from '@/components/ProductGrid';
 
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} | GUDARA` : 'Produk | GUDARA' };
}
 
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
 
  if (!product) notFound();
 
  const related = await getRelatedProducts(product.kat, product.slug, 4);
  const featureList = toFeatureList(product.materialSpec);
 
  const accordionSections = [
    {
      title: 'Spesifikasi Material',
      body: featureList ? (
        <ul className="pdp-feature-list">
          {featureList.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      ) : (
        <p>{product.materialSpec || 'Detail material belum tersedia untuk produk ini.'}</p>
      ),
    },
    {
      title: 'Pengiriman & Retur',
      body: (
        <p>
          Dikirim dari Bandung dalam 1–2 hari kerja. Komplain ukuran/cacat produksi diterima
          maks. 2×24 jam setelah barang diterima — chat admin via WhatsApp untuk proses tukar.
        </p>
      ),
    },
    {
      title: 'Cara Perawatan',
      body: <p>Cuci dengan air dingin, jangan disikat pada bagian sablon/emboss, jemur terbalik di tempat teduh.</p>,
    },
  ];
 
  return (
    <section className="pdp wrap">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/etalase?kat=${product.kat}`}>{titleCase(product.kat)}</Link>
        <span>/</span>
        <span className="breadcrumb__current">{product.name}</span>
      </nav>
 
      <div className="pdp-layout">
        <ProductGallery images={product.images} name={product.name} />
 
        <div className="pdp-info">
          <div className="pdp-head">
            <div>
              <span className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>{titleCase(product.kat)}</span>
              <h1 className="pdp-title">{product.name}</h1>
            </div>
            <div className="pdp-price-row">
              <span className="price" style={{ fontSize: 22 }}>{formatRp(product.price)}</span>
              {product.old && <span className="price-old" style={{ fontSize: 16 }}>{formatRp(product.old)}</span>}
              {product.off && <span className="pdp-badge">{product.off}</span>}
            </div>
          </div>
 
          <AddToCartSection product={product} hideAddToCart={product.kat === 'custom'} />
          <p className="pdp-shipping-note">Gratis ongkir untuk pembelian di atas Rp 300.000</p>
 
          <ProductAccordion sections={accordionSections} />
        </div>
      </div>
 
      {related.length > 0 && (
        <section className="pdp-related">
          <div className="section-head">
            <div>
              <span className="eyebrow">Kamu Mungkin Juga Suka</span>
              <h2>Produk Terkait</h2>
            </div>
            <Link className="see-all" href={`/etalase?kat=${product.kat}`}>Lihat Semua &rarr;</Link>
          </div>
          <ProductGrid products={related} variant={product.kat === 'custom' ? 'custom' : 'shop'} />
        </section>
      )}
 
      <div className="pdp-sticky-cta">
        <div className="pdp-sticky-cta__info">
          <span className="pdp-sticky-cta__name">{product.name}</span>
          <span className="price">{formatRp(product.price)}</span>
        </div>
        <a
          href={`https://wa.me/628131648947?text=Halo%20Admin%20Gudara%2C%20saya%20mau%20tanya%20stok%20${encodeURIComponent(product.name)}`}
          className="btn btn--dark"
        >
          Tanya Stok
        </a>
      </div>
    </section>
  );
}
