export const dynamic = 'force-dynamic';
 
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { formatRp, titleCase, toFeatureList, parseTextBlocks } from '@/lib/format';
import AddToCartSection from '@/components/AddToCartSection';
import ProductGallery from '@/components/ProductGallery';
import ProductAccordion from '@/components/ProductAccordion';
import ProductGrid from '@/components/ProductGrid';
import DesignRefGrid from '@/components/DesignRefGrid';
import CollarOptionsGrid from '@/components/CollarOptionsGrid';
import MaterialCatalogGrid from '@/components/MaterialCatalogGrid';
import { MATERIALS } from '@/lib/materials';
 
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
  const careBlocks = parseTextBlocks(product.careInstructions);
 
  const accordionSections = [
    // Deskripsi umum produk (kolom `description`) — cuma ditampilkan kalau
    // memang sudah diisi di Supabase, supaya produk lama yang belum diisi
    // tidak menampilkan section kosong.
    ...(product.description
      ? [
          {
            title: 'Deskripsi Produk',
            body: <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>,
          },
        ]
      : []),
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
      title: 'Panduan Ukuran',
      body: product.sizeChartUrl ? (
        <img src={product.sizeChartUrl} alt={`Panduan ukuran ${product.name}`} className="pdp-size-chart-img" />
      ) : (
        <p>Panduan ukuran belum tersedia untuk produk ini — chat admin untuk info detail ukuran.</p>
      ),
    },
    {
      title: 'Cara Perawatan',
      body:
        careBlocks.length > 0 ? (
          <div className="pdp-care">
            {careBlocks.map((block, i) => {
              if (block.type === 'heading') {
                return (
                  <p className="pdp-care__heading" key={i}>
                    {block.text}
                  </p>
                );
              }
              if (block.type === 'list') {
                return (
                  <ul className="pdp-feature-list" key={i}>
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={i}>{block.text}</p>;
            })}
          </div>
        ) : (
          <p>
            {product.careInstructions ||
              'Cuci dengan air dingin, jangan disikat pada bagian sablon/emboss, jemur terbalik di tempat teduh.'}
          </p>
        ),
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
 
          <AddToCartSection
            product={product}
            hideAddToCart={product.kat === 'custom'}
            sizeChartUrl={product.sizeChartUrl}
          />

          {product.kat === 'custom' && (
            <div className="pdp-order-guide">
              <div className="pdp-order-guide__moq">Minimum Order 12 pcs / desain</div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Cara Order Custom</div>
              <ol className="pdp-order-guide__list">
                <li>
                  <span className="pdp-order-guide__num">1</span>
                  <span>Pilih desain &amp; cek Katalog Bahan di bawah</span>
                </li>
                <li>
                  <span className="pdp-order-guide__num">2</span>
                  <span>Chat admin: warna, logo, nameset, jumlah pcs</span>
                </li>
                <li>
                  <span className="pdp-order-guide__num">3</span>
                  <span>Approve mockup desain, lalu bayar DP</span>
                </li>
                <li>
                  <span className="pdp-order-guide__num">4</span>
                  <span>Produksi, lalu dikirim setelah pelunasan</span>
                </li>
              </ol>
            </div>
          )}
 
          <div id="panduan-ukuran">
            <ProductAccordion sections={accordionSections} />
          </div>
        </div>
      </div>

      {product.designReferences.length > 0 && (
        <section className="pdp-related pdp-design-refs">
          <div className="section-head">
            <div>
              <span className="eyebrow">Contoh Hasil Jadi</span>
              <h2>Referensi Desain</h2>
            </div>
          </div>
          <DesignRefGrid images={product.designReferences} productName={product.name} />
        </section>
      )}

      {product.collarOptions.length > 0 && (
        <section className="pdp-collar-options">
          <div className="section-head">
            <div>
              <span className="eyebrow">Custom Kerah</span>
              <h2>Pilihan Kerah</h2>
            </div>
          </div>
          <p className="pdp-collar-options__intro">
            Tap foto untuk perbesar, atau tap kode kerah untuk salin &mdash; tinggal paste ke admin saat
            konsultasi desain.
          </p>
          <CollarOptionsGrid options={product.collarOptions} />
        </section>
      )}
 
      {product.kat === 'custom' && (
        <section className="pdp-material-catalog">
          <div className="section-head">
            <div>
              <span className="eyebrow">Katalog Bahan</span>
              <h2>Pilihan Bahan</h2>
            </div>
          </div>
          <p className="pdp-material-catalog__intro">
            Tap foto untuk lihat lebih dekat. Sebutkan nama bahan pilihanmu ke admin saat konsultasi desain.
          </p>
          <MaterialCatalogGrid materials={MATERIALS} />
        </section>
      )}

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
