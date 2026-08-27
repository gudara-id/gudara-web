export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJournalPostBySlug, journalCategoryLabel } from '@/lib/journal';
import { formatDate } from '@/lib/format';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  return { title: post ? `${post.title} | GUDARA` : 'Jurnal | GUDARA' };
}

export default async function JurnalDetailPage({ params }) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);

  if (!post) notFound();

  const paragraphs = post.content.split(/\n\s*\n/).filter(Boolean);

  return (
    <article className="journal-detail wrap">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/jurnal">Jurnal</Link>
        <span>/</span>
        <span className="breadcrumb__current">{post.title}</span>
      </nav>

      <div className="journal-detail__head">
        <span className="eyebrow">{journalCategoryLabel(post.category)}</span>
        <h1 style={{ fontSize: 'clamp(28px,4.5vw,48px)', margin: '8px 0 12px' }}>{post.title}</h1>
        <span className="journal-card__date">{formatDate(post.eventDate || post.publishedAt)}</span>
      </div>

      <div className="journal-detail__cover">
        <img src={post.cover} alt={post.title} />
      </div>

      <div className="journal-detail__body">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {post.gallery.length > 0 && (
        <div className="journal-detail__gallery">
          {post.gallery.map((img, i) => (
            <figure key={i}>
              <img src={img.url} alt={img.caption || post.title} />
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      <div style={{ marginTop: 48 }}>
        <Link href="/jurnal" className="btn btn--outline">&larr; Kembali ke Jurnal</Link>
      </div>
    </article>
  );
}
