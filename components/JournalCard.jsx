import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { journalCategoryLabel } from '@/lib/journal';

export default function JournalCard({ post }) {
  return (
    <Link href={`/jurnal/${post.slug}`} className="journal-card">
      <div className="journal-card__image">
        <img src={post.cover} alt={post.title} loading="lazy" />
        <span className="journal-card__tag">{journalCategoryLabel(post.category)}</span>
      </div>
      <div className="journal-card__body">
        <span className="journal-card__date">
          {formatDate(post.eventDate || post.publishedAt)}
        </span>
        <h3 className="journal-card__title">{post.title}</h3>
        {post.excerpt && <p className="journal-card__excerpt">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
