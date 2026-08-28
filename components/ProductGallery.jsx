'use client';

import { useEffect, useRef, useState } from 'react';

const ZOOM_LEVEL = 2.5; // how much the lens panel magnifies
const LENS_SIZE_PCT = 100 / ZOOM_LEVEL; // lens box size as % of the image

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const hasMultiple = images.length > 1;
  const mainRef = useRef(null);

  // Marketplace-style magnifier: lens box on the image + zoomed panel beside it.
  const [isZooming, setIsZooming] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 }); // top-left of lens, in %
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 }); // background-position center, in %

  // Fullscreen tap-to-view (mobile / touch devices without a mouse).
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Only devices with a real mouse (hover + fine pointer) get the
  // marketplace-style zoom lens. On touch devices this stays false, so
  // taps never leave a lens box "stuck" on the photo (see handleTouchStart).
  const [canHoverZoom, setCanHoverZoom] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHoverZoom(mq.matches);
  }, []);

  function goPrev() {
    setActive((i) => (i - 1 + images.length) % images.length);
  }
  function goNext() {
    setActive((i) => (i + 1) % images.length);
  }

  // Touch swipe support (mobile "geser" gesture).
  // A ref (not a plain variable) so the value set on touchstart survives
  // through to touchend even if something else re-renders the component
  // in between — a plain local variable gets reset to 0 on every render
  // and silently breaks the swipe.
  const touchStartXRef = useRef(0);
  function handleTouchStart(e) {
    touchStartXRef.current = e.touches[0].clientX;
    // Make sure no leftover zoom lens is showing on touch devices.
    if (isZooming) setIsZooming(false);
  }
  function handleTouchEnd(e) {
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) goPrev();
    else goNext();
  }

  function handleMouseMove(e) {
    if (!canHoverZoom) return;
    const rect = mainRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp so the lens box (and the zoomed view) never goes past the image edge.
    const half = LENS_SIZE_PCT / 2;
    const clampedX = Math.min(Math.max(rawX, half), 100 - half);
    const clampedY = Math.min(Math.max(rawY, half), 100 - half);

    setLensPos({ x: clampedX - half, y: clampedY - half });
    setBgPos({ x: clampedX, y: clampedY });
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

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

  return (
    <div className="pdp-gallery">
      <div
        ref={mainRef}
        className="pdp-gallery__main"
        onTouchStart={handleTouchStart}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
        onMouseEnter={() => canHoverZoom && setIsZooming(true)}
        onMouseLeave={() => canHoverZoom && setIsZooming(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setLightboxOpen(true)}
        role="button"
        aria-label="Perbesar foto produk"
      >
        <img src={images[active]} alt={name} />

        {isZooming && (
          <div
            className="pdp-gallery__lens"
            style={{
              left: `${lensPos.x}%`,
              top: `${lensPos.y}%`,
              width: `${LENS_SIZE_PCT}%`,
              height: `${LENS_SIZE_PCT}%`,
            }}
          />
        )}

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

        {/* Zoomed-in panel — shown next to the image while hovering, like on marketplace PDPs */}
        {isZooming && (
          <div
            className="pdp-gallery__zoom-panel"
            style={{
              backgroundImage: `url(${images[active]})`,
              backgroundSize: `${ZOOM_LEVEL * 100}% ${ZOOM_LEVEL * 100}%`,
              backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
            }}
          />
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
            <img src={images[active]} alt={name} className="pdp-lightbox__img" />
          </div>

          {hasMultiple && (
            <>
              <button
                className="pdp-lightbox__arrow pdp-lightbox__arrow--prev"
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
                className="pdp-lightbox__arrow pdp-lightbox__arrow--next"
                onClick={(e) => {
                  e.stopPropagation();
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
