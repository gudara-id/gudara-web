'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBox({ current }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(current || '');

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set('q', value.trim());
    } else {
      params.delete('q');
    }
    router.push(`/etalase?${params.toString()}`);
  }

  function clear() {
    setValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/etalase?${params.toString()}`);
  }

  return (
    <form className="search-box" onSubmit={submit} role="search">
      <svg className="search-box__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        className="search-box__input"
        placeholder="Cari produk..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Cari produk"
      />
      {value && (
        <button type="button" className="search-box__clear" onClick={clear} aria-label="Hapus pencarian">
          &times;
        </button>
      )}
    </form>
  );
}
