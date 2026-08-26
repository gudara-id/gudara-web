'use client';

import { useState } from 'react';

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const hasMultiple = images.length > 1;

  return (
    <div className="pdp-gallery">
      <div className="pdp-gallery__main">
        <img src={images[active]} alt={name} />
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
