'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProductRow } from '@/lib/products';
import { formatRp } from '@/lib/format';

const SUGGEST_LIMIT = 6;
// Ditunda dikit (bukan langsung nembak query di tiap keystroke) supaya orang
// yang ngetik cepat tidak bikin request bertubi-tubi ke Supabase — tetap
// terasa "instan" buat mata, tapi jauh lebih hemat.
const DEBOUNCE_MS = 250;

export default function SearchBox({ current }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(current || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapRef = useRef(null);
  // Nomor urut tiap request — dipakai buat buang hasil query yang "telat"
  // (kalau orang ngetik lagi sebelum request sebelumnya selesai, hasil lama
  // itu tidak boleh menimpa balik hasil yang lebih baru saat sama-sama selesai
  // belakangan / race condition khas typeahead search).
  const requestIdRef = useRef(0);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live suggestions — jalan dari huruf pertama yang diketik, bukan nunggu
  // Enter/submit seperti sebelumnya.
  useEffect(() => {
    const q = value.trim();
    if (!q) {
      setSuggestions([]);
      setLoading(false);
      setOpen(false);
      return;
    }
    setLoading(true);
    const myRequestId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      try {
        const rows = await getProductRow(null, SUGGEST_LIMIT, 'newest', q, { excludeCustom: true });
        if (myRequestId === requestIdRef.current) {
          setSuggestions(rows);
          setOpen(true);
          setHighlighted(-1);
        }
      } catch {
        if (myRequestId === requestIdRef.current) setSuggestions([]);
      } finally {
        if (myRequestId === requestIdRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  function goToResults(q) {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    setOpen(false);
    router.push(`/etalase?${params.toString()}`);
  }

  function submit(e) {
    e.preventDefault();
    // Enter dengan salah satu saran ter-highlight (lewat panah atas/bawah)
    // langsung ke halaman produk itu; kalau tidak, lanjut seperti biasa ke
    // halaman hasil pencarian penuh.
    if (highlighted >= 0 && suggestions[highlighted]) {
      setOpen(false);
      router.push(`/produk/${suggestions[highlighted].slug}`);
      return;
    }
    goToResults(value);
  }

  function clear() {
    setValue('');
    setSuggestions([]);
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/etalase?${params.toString()}`);
  }

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="search-box-wrap" ref={wrapRef}>
      <form className="search-box" onSubmit={submit} role="search" autoComplete="off">
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
          onFocus={() => {
            if (suggestions.length) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          aria-label="Cari produk"
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
        />
        {value && (
          <button type="button" className="search-box__clear" onClick={clear} aria-label="Hapus pencarian">
            &times;
          </button>
        )}
      </form>

      {open && (
        <div className="search-suggest">
          {loading ? (
            <div className="search-suggest__status">Mencari...</div>
          ) : suggestions.length > 0 ? (
            <>
              <ul className="search-suggest__list">
                {suggestions.map((p, i) => (
                  <li key={p.id}>
                    <Link
                      href={`/produk/${p.slug}`}
                      className={`search-suggest__item${i === highlighted ? ' is-highlighted' : ''}`}
                      onMouseEnter={() => setHighlighted(i)}
                      onClick={() => setOpen(false)}
                    >
                      <img src={p.image} alt="" className="search-suggest__thumb" />
                      <span className="search-suggest__info">
                        <span className="search-suggest__name">{p.name}</span>
                        <span className="search-suggest__price">{formatRp(p.price)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" className="search-suggest__all" onClick={() => goToResults(value)}>
                Lihat semua hasil untuk &quot;{value.trim()}&quot;
              </button>
            </>
          ) : (
            <div className="search-suggest__status">
              Tidak ada produk yang cocok dengan &quot;{value.trim()}&quot;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
