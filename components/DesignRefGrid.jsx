'use client';

import { useEffect, useState } from 'react';

// Grid galeri "Referensi Desain" — dulu cuma kotak flat yang buka tab baru.
// Sekarang: nomor urut, overlay hover, dan klik buka lightbox in-page
// (konsisten dengan lightbox foto produk utama) supaya konsumen bisa
// zoom tanpa kehilangan konteks halaman produk.
export default function DesignRefGrid({ images, productName }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const isOpen = activeIndex !== null;

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % images.length);
    }
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, images.length]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="pdp-design-refs__grid">
        {images.map((src, i) => (
          <button
            type="button"
            key={src + i}
            className="pdp-design-refs__item"
            onClick={() => setActiveIndex(i)}
            aria-label={`Perbesar referensi desain ${i + 1}`}
          >
            <img src={src} alt={`Referensi desain ${productName} ${i + 1}`} loading="lazy" />
            <span className="pdp-design-refs__index">{String(i + 1).padStart(2, '0')}</span>
            <span className="pdp-design-refs__overlay">
              <span className="pdp-design-refs__overlay-icon" aria-hidden="true">&#128269;</span>
              Lihat Detail
            </span>
          </button>
        ))}
      </div>

      {isOpen && (
        <div className="pdp-lightbox" onClick={() => setActiveIndex(null)}>
          <button
            className="pdp-lightbox__close"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(null);
            }}
            aria-label="Tutup"
            type="button"
          >
            &times;
          </button>

          <div className="pdp-lightbox__stage" onClick={(e) => e.stopPropagation()}>
            <img src={images[activeIndex]} alt={`Referensi desain ${productName}`} className="pdp-lightbox__img" />
          </div>

          {images.length > 1 && (
            <>
              <button
                className="pdp-lightbox__arrow pdp-lightbox__arrow--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i - 1 + images.length) % images.length);
                }}
                aria-label="Referensi sebelumnya"
                type="button"
              >
                &lsaquo;
              </button>
              <button
                className="pdp-lightbox__arrow pdp-lightbox__arrow--next"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i + 1) % images.length);
                }}
                aria-label="Referensi berikutnya"
                type="button"
              >
                &rsaquo;
              </button>
              <span className="pdp-lightbox__counter">{activeIndex + 1} / {images.length}</span>
            </>
          )}
        </div>
      )}
    </>
  );
}
