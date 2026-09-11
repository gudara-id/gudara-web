import Link from 'next/link';

// Bikin ulang query string yang sedang aktif (kat, q, sort) tapi ganti nomor
// halamannya — supaya pindah halaman tidak menghapus filter/sort/search yang
// lagi dipakai user.
function pageHref(baseParams, page) {
  const params = new URLSearchParams(baseParams);
  if (page <= 1) params.delete('page');
  else params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/etalase?${qs}` : '/etalase';
}

export default function Pagination({ page, totalPages, searchParams }) {
  if (totalPages <= 1) return null;

  const base = { ...searchParams };
  delete base.page;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  // Tampilkan maksimal 5 nomor halaman di sekitar halaman aktif, biar tidak
  // kepanjangan kalau total halamannya banyak.
  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const windowEnd = Math.min(totalPages, windowStart + 4);
  const numbers = [];
  for (let p = windowStart; p <= windowEnd; p++) numbers.push(p);

  return (
    <nav aria-label="Navigasi halaman" className="pagination">
      {prevDisabled ? (
        <span className="pagination__btn pagination__btn--disabled">← Sebelumnya</span>
      ) : (
        <Link href={pageHref(base, page - 1)} className="pagination__btn">
          ← Sebelumnya
        </Link>
      )}

      <div className="pagination__numbers">
        {windowStart > 1 && (
          <>
            <Link href={pageHref(base, 1)} className="pagination__num">1</Link>
            {windowStart > 2 && <span className="pagination__ellipsis">…</span>}
          </>
        )}
        {numbers.map((p) => (
          <Link
            key={p}
            href={pageHref(base, p)}
            className={`pagination__num${p === page ? ' pagination__num--active' : ''}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Link>
        ))}
        {windowEnd < totalPages && (
          <>
            {windowEnd < totalPages - 1 && <span className="pagination__ellipsis">…</span>}
            <Link href={pageHref(base, totalPages)} className="pagination__num">
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {nextDisabled ? (
        <span className="pagination__btn pagination__btn--disabled">Selanjutnya →</span>
      ) : (
        <Link href={pageHref(base, page + 1)} className="pagination__btn">
          Selanjutnya →
        </Link>
      )}
    </nav>
  );
}
