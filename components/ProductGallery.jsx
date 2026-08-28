'use client';

import { useEffect, useState } from 'react';

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const hasMultiple = images.length > 1;

  // Hover-zoom (desktop): scales the image and follows the cursor.
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Click-to-zoom lightbox (desktop + mobile).
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);

  function goPrev() {
    setActive((i) => (i - 1 + images.length) % images.length);
  }
  function goNext() {
    setActive((i) => (i + 1) % images.length);
  }

  // Touch swipe support (mobile "geser" gesture)
  let touchStartX = 0;
  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) goPrev();
    else goNext();
  }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  function openLightbox() {
    setLightboxZoomed(false);
    setLightboxOpen(true);
  }
  function closeLightbox() {
    setLightboxOpen(false);
    setLightboxZoomed(false);
  }

  // Close lightbox with Escape, lock page scroll while it's open.
  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && hasMultiple) goPrev();
      if (e.key === 'ArrowRight' && hasMultiple) goNext();
    }
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, hasMultiple]);

  useEffect(() => {
    setLightboxZoomed(false);
  }, [active]);

  return (
    <div className="pdp-gallery">
      <div
        className="pdp-gallery__main"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
        onMouseEnter={() => setIsHoverZooming(true)}
        onMouseLeave={() => setIsHoverZooming(false)}
        onMouseMove={handleMouseMove}
        onClick={openLightbox}
        role="button"
        aria-label="Perbesar foto produk"
      >
        <img
          src={images[active]}
          alt={name}
          className={`pdp-gallery__img${isHoverZooming ? ' is-zoomed' : ''}`}
          style={isHoverZooming ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
        />
        <span className="pdp-gallery__zoom-hint" aria-hidden="true">
          &#128269;
        </span>
        {hasMultiple && (
          <>
            <button
              className="pdp-gallery__arrow pdp-gallery__arrow--prev"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Foto sebelumnya"
              type="button"
            >
              &lsaquo;
            </button>
            <button
              className="pdp-gallery__arrow pdp-gallery__arrow--next"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Foto berikutnya"
              type="button"
            >
              &rsaquo;
            </button>
            <span className="pdp-gallery__counter">{active + 1} / {images.length}</span>
          </>
        )}
      </div>
      {hasMultiple && (
        <div className="pdp-gallery__thumbs">
          {images.map((src, i) => (
            <button
              key={src + i}
              className={`pdp-gallery__thumb${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Lihat foto ${i + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div className="pdp-lightbox" onClick={closeLightbox}>
          <button
            className="pdp-lightbox__close"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Tutup"
            type="button"
          >
            &times;
          </button>

          <div className="pdp-lightbox__stage" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[active]}
              alt={name}
              className={`pdp-lightbox__img${lightboxZoomed ? ' is-zoomed' : ''}`}
              onClick={() => setLightboxZoomed((z) => !z)}
            />
          </div>

          {hasMultiple && (
            <>
              <button
                className="pdp-lightbox__arrow pdp-lightbox__arrow--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxZoomed(false);
                  goPrev();
                }}
                aria-label="Foto sebelumnya"
                type="button"
              >
                &lsaquo;
              </button>
              <button
                className="pdp-lightbox__arrow pdp-lightbox__arrow--next"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxZoomed(false);
                  goNext();
                }}
                aria-label="Foto berikutnya"
                type="button"
              >
                &rsaquo;
              </button>
              <span className="pdp-lightbox__counter">{active + 1} / {images.length}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
