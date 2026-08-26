'use client';

import { useState } from 'react';

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const hasMultiple = images.length > 1;

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

  return (
    <div className="pdp-gallery">
      <div
        className="pdp-gallery__main"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
      >
        <img src={images[active]} alt={name} />
        {hasMultiple && (
          <>
            <button
              className="pdp-gallery__arrow pdp-gallery__arrow--prev"
              onClick={goPrev}
              aria-label="Foto sebelumnya"
              type="button"
            >
              &lsaquo;
            </button>
            <button
              className="pdp-gallery__arrow pdp-gallery__arrow--next"
              onClick={goNext}
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
    </div>
  );
}
