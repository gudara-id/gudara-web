'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Grid "Pilihan Kerah" — dulu kartu kecil datar, teks kode susah kebaca dan
// harus buka tab baru buat lihat detail. Sekarang: kartu lebih besar dengan
// efek angkat saat hover, klik untuk zoom in-page, dan tombol salin kode
// biar konsumen tinggal paste ke chat admin, tidak perlu ngetik ulang.
export default function CollarOptionsGrid({ options }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [copiedLabel, setCopiedLabel] = useState(null);
  const isOpen = activeIndex !== null;
  // Render lewat portal ke <body> supaya lightbox tidak pernah kejebak di
  // stacking context ancestor manapun (lihat catatan di ProductGallery.jsx).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + options.length) % options.length);
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % options.length);
    }
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, options.length]);

  if (!options || options.length === 0) return null;

  function copyLabel(label) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(label).catch(() => {});
    }
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel((cur) => (cur === label ? null : cur)), 1500);
  }

  const active = isOpen ? options[activeIndex] : null;

  return (
    <>
      <div className="pdp-collar-options__grid">
        {options.map((c, i) => (
          <div className="pdp-collar-options__item" key={c.url}>
            <button
              type="button"
              className="pdp-collar-options__photo"
              onClick={() => setActiveIndex(i)}
              aria-label={`Perbesar ${c.label}`}
            >
              <img src={c.url} alt={c.label} loading="lazy" />
            </button>
            <button
              type="button"
              className="pdp-collar-options__label"
              onClick={() => copyLabel(c.label)}
            >
              {copiedLabel === c.label ? 'Tersalin \u2713' : c.label}
            </button>
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
            <img src={active.url} alt={active.label} className="pdp-lightbox__img" />
          </div>

          <button
            type="button"
            className="pdp-lightbox__copy"
            onClick={(e) => {
              e.stopPropagation();
              copyLabel(active.label);
            }}
          >
            {copiedLabel === active.label ? 'Tersalin \u2713' : `Salin \u201c${active.label}\u201d`}
          </button>

          {options.length > 1 && (
            <>
              <button
                className="pdp-lightbox__arrow pdp-lightbox__arrow--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i - 1 + options.length) % options.length);
                }}
                aria-label="Kerah sebelumnya"
                type="button"
              >
                &lsaquo;
              </button>
              <button
                className="pdp-lightbox__arrow pdp-lightbox__arrow--next"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i + 1) % options.length);
                }}
                aria-label="Kerah berikutnya"
                type="button"
              >
                &rsaquo;
              </button>
              <span className="pdp-lightbox__counter">{activeIndex + 1} / {options.length}</span>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
