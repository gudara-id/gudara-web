'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function SizeGuideModal({ imageUrl, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="pdp-lightbox" onClick={onClose}>
      <button
        className="pdp-lightbox__close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Tutup"
        type="button"
      >
        &times;
      </button>
      <div className="pdp-lightbox__stage" onClick={(e) => e.stopPropagation()}>
        <div className="pdp-size-guide-modal__frame">
          <Image
            src={imageUrl}
            alt="Panduan ukuran"
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
    </div>
  );
}
