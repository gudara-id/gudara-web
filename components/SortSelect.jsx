'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
];

export default function SortSelect({ current }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', e.target.value);
    }
    router.push(`/etalase?${params.toString()}`);
  }

  return (
    <select className="sort-select" value={current} onChange={handleChange} aria-label="Urutkan produk">
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          Urutkan: {o.label}
        </option>
      ))}
    </select>
  );
}
