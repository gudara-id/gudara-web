import Image from 'next/image';

export default function ReferenceDesignSection({ images }) {
  if (!images || images.length === 0) return null;

  return (
    <section className="pdp-reference">
      <div className="section-head">
        <div>
          <span className="eyebrow">Referensi Desain</span>
          <h2>Contoh Desain untuk Produk Ini</h2>
        </div>
      </div>
      <div className="pdp-reference__grid">
        {images.map((src, i) => (
          <div className="pdp-reference__item" key={src + i}>
            <Image
              src={src}
              alt={`Referensi desain ${i + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
