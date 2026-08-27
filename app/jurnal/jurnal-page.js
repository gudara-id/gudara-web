export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getJournalPosts, journalCategoryLabel } from '@/lib/journal';
import JournalCard from '@/components/JournalCard';

export const metadata = { title: 'Jurnal | GUDARA' };

export default async function JurnalPage({ searchParams }) {
  const sp = await searchParams;
  const kat = sp?.kat;
  const posts = await getJournalPosts(kat, 24);

  return (
    <section className="section--tight wrap" style={{ paddingTop: 40 }}>
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="breadcrumb__current">Jurnal</span>
      </nav>

      <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', margin: '8px 0 12px' }}>Jurnal</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 24, maxWidth: 560 }}>
        Berita, event, dan portofolio dari perjalanan GUDARA.
      </p>

      <div className="filter-row">
        <Link href="/jurnal" className={`filter-pill${!kat ? ' active' : ''}`}>Semua</Link>
        <Link href="/jurnal?kat=berita" className={`filter-pill${kat === 'berita' ? ' active' : ''}`}>Berita</Link>
        <Link href="/jurnal?kat=event" className={`filter-pill${kat === 'event' ? ' active' : ''}`}>Event</Link>
        <Link href="/jurnal?kat=portofolio" className={`filter-pill${kat === 'portofolio' ? ' active' : ''}`}>Portofolio</Link>
      </div>

      {posts.length === 0 ? (
        <div className="search-empty">
          <p>
            Belum ada postingan {kat ? <strong>{journalCategoryLabel(kat)}</strong> : 'jurnal'} untuk saat ini.
          </p>
        </div>
      ) : (
        <div className="journal-grid" style={{ marginBottom: 80 }}>
          {posts.map((post) => (
            <JournalCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
