'use client';

import { useState } from 'react';

export default function ProductAccordion({ sections }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="pdp-accordion">
      {sections.map((s, i) => (
        <div key={s.title} className="pdp-accordion__item">
          <button
            className="pdp-accordion__head"
            onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            aria-expanded={openIndex === i}
          >
            <span>{s.title}</span>
            <span className="pdp-accordion__icon">{openIndex === i ? '−' : '+'}</span>
          </button>
          {openIndex === i && <div className="pdp-accordion__body">{s.body}</div>}
        </div>
      ))}
    </div>
  );
}
