'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Grid "Katalog Bahan" — dipakai di halaman produk Custom Kits supaya
// konsumen punya gambaran tekstur/tampilan bahan sebelum konsultasi desain,
// tanpa harus tanya admin satu-satu dulu. Struktur & pola lightbox meniru
// CollarOptionsGrid.jsx, tapi tiap kartu juga menampilkan nama + deskripsi
// singkat bahannya (bukan cuma kode seperti kerah).
export default function MaterialCatalogGrid({ materials }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const isOpen = activeIndex !== null;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + materials.length) % materials.length);
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % materials.length);
    }
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, materials.length]);

  if (!materials || materials.length === 0) return null;

  const active = isOpen ? materials[activeIndex] : null;

  return (
    <>
      <div className="pdp-material-catalog__grid">
        {materials.map((m, i) => (
          <div className="pdp-material-catalog__item" key={m.slug}>
            <button
              type="button"
              className="pdp-material-catalog__photo"
              onClick={() => setActiveIndex(i)}
              aria-label={`Perbesar bahan ${m.name}`}
            >
              <img src={m.image} alt={m.name} loading="lazy" />
            </button>
            <div className="pdp-material-catalog__name">{m.name}</div>
            <p className="pdp-material-catalog__desc">{m.description}</p>
          </div>
        ))}
      </div>

      {mounted && isOpen && createPortal(
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
            <img src={active.image} alt={active.name} className="pdp-lightbox__img" />
          </div>

          <div className="pdp-lightbox__material-info">
            <div className="pdp-lightbox__material-name">{active.name}</div>
            <p className="pdp-lightbox__material-desc">{active.description}</p>
          </div>

          {materials.length > 1 && (
            <>
              <button
                className="pdp-lightbox__arrow pdp-lightbox__arrow--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i - 1 + materials.length) % materials.length);
                }}
                aria-label="Bahan sebelumnya"
                type="button"
              >
                &lsaquo;
              </button>
              <button
                className="pdp-lightbox__arrow pdp-lightbox__arrow--next"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i + 1) % materials.length);
                }}
                aria-label="Bahan berikutnya"
                type="button"
              >
                &rsaquo;
              </button>
              <span className="pdp-lightbox__counter">{activeIndex + 1} / {materials.length}</span>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
