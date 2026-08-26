import ProductCard from './ProductCard';

export default function ProductGrid({ products, emptyLabel = 'Belum ada produk di kategori ini.' }) {
  if (!products || products.length === 0) {
    return <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{emptyLabel}</p>;
  }
  return (
    <div className="p-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
