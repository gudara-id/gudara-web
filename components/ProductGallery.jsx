'use client';

import { useEffect, useRef, useState } from 'react';

const ZOOM_LEVEL = 2.5; // how much the lens panel magnifies
const LENS_SIZE_PCT = 100 / ZOOM_LEVEL; // lens box size as % of the image
const SWIPE_THRESHOLD = 40; // px — minimum horizontal drag to count as a swipe

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  // Satu state dipakai bareng buat foto utama & thumbnail — kalau sebuah URL
  // gagal dimuat (404/rusak), ditandai di sini sekali dan tidak dicoba lagi.
  const [brokenImages, setBrokenImages] = useState({});
  const hasMultiple = images.length > 1;
  const allBroken = images.length > 0 && images.every((_, i) => brokenImages[i]);
  const mainRef = useRef(null);

  // Marketplace-style magnifier: lens box on the image + zoomed panel beside it.
  const [isZooming, setIsZooming] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 }); // top-left of lens, in %
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 }); // background-position center, in %

  // Fullscreen tap-to-view (mobile / touch devices without a mouse).
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Touch/swipe tracking — refs, not state, since they're read/written within
  // the same gesture and shouldn't trigger re-renders.
  const touchStartRef = useRef(null); // {x, y} or null when the touch started on a button
  const justSwipedRef = useRef(false); // true right after a real swipe, to swallow the ghost click that follows

  // Cari index foto berikutnya (searah `direction`, 1 atau -1) yang belum
  // ketahuan rusak — jadi tombol prev/next tidak pernah "mendarat" lagi di
  // foto yang sudah gagal dimuat sebelumnya (dulu ini yang bikin klik "back"
  // nampilin kotak putih kosong).
  function nextWorkingIndex(from, direction) {
    for (let step = 1; step <= images.length; step++) {
      const i = (from + direction * step + images.length) % images.length;
      if (!brokenImages[i]) return i;
    }
    return from;
  }

  function goPrev() {
    setActive((i) => nextWorkingIndex(i, -1));
  }
  function goNext() {
    setActive((i) => nextWorkingIndex(i, 1));
  }

  function markBroken(i) {
    setBrokenImages((prev) => {
      if (prev[i]) return prev;
      const next = { ...prev, [i]: true };
      // Kalau foto yang lagi aktif ternyata yang gagal load, langsung geser
      // ke foto valid berikutnya alih-alih diam nampilin area kosong.
      if (i === active) {
        for (let step = 1; step <= images.length; step++) {
          const j = (i + step) % images.length;
          if (!next[j]) {
            setActive(j);
            break;
          }
        }
      }
      return next;
    });
  }

  function handleTouchStart(e) {
    // Ignore touches that start on a button (prev/next arrows) — those have
    // their own onClick and shouldn't also be interpreted as a swipe.
    if (e.target.closest('button')) {
      touchStartRef.current = null;
      return;
    }
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const t = e.changedTouches[0];
    const diffX = t.clientX - start.x;
    const diffY = t.clientY - start.y;

    // Only treat it as a swipe if the drag was mostly horizontal and past
    // the threshold — otherwise this was a vertical scroll or a plain tap.
    if (Math.abs(diffX) >= SWIPE_THRESHOLD && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) goPrev();
      else goNext();
      // A swipe fires a synthetic "click" right after touchend on most mobile
      // browsers — without this flag that ghost click would immediately pop
      // the lightbox open right after swiping to the next photo.
      justSwipedRef.current = true;
    }
  }

  function handleMouseMove(e) {
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

  function handleMainClick(e) {
    if (justSwipedRef.current) {
      justSwipedRef.current = false;
      return;
    }
    // Belt-and-suspenders: a tap on the arrow buttons already stops
    // propagation on its own onClick, but skip here too just in case.
    if (e.target.closest('button')) return;
    if (allBroken) return;
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
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

  return (
    <div className="pdp-gallery">
      <div
        ref={mainRef}
        className="pdp-gallery__main"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
        onClick={handleMainClick}
        role="button"
        aria-label="Perbesar foto produk"
      >
        {allBroken ? (
          <div className="pdp-gallery__fallback">Foto produk belum tersedia</div>
        ) : (
          <img src={images[active]} alt={name} onError={() => markBroken(active)} />
        )}

        {isZooming && !allBroken && (
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
        {isZooming && !allBroken && (
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
          {images.map((src, i) =>
            brokenImages[i] ? null : (
              <button
                key={src + i}
                className={`pdp-gallery__thumb${i === active ? ' is-active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Lihat foto ${i + 1}`}
              >
                <img src={src} alt="" onError={() => markBroken(i)} />
              </button>
            )
          )}
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

          <div
            className="pdp-lightbox__stage"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={hasMultiple ? handleTouchStart : undefined}
            onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
          >
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
