import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import JournalForm from '@/components/JournalForm';
import JournalImages from '@/components/JournalImages';

export const dynamic = 'force-dynamic';

export default async function AdminEditJournalPage({ params }) {
  const supabase = getSupabaseAdmin();
  const { id } = await params;

  const { data: post } = await supabase
    .from('journal_posts')
    .select('*, journal_images(id, url, caption, sort_order)')
    .eq('id', id)
    .single();

  if (!post) {
    return (
      <section className="wrap admin-shell admin-shell--narrow">
        <Link href="/admin/jurnal" className="admin-back">&larr; Kembali ke Jurnal</Link>
        <p>Postingan tidak ditemukan.</p>
      </section>
    );
  }

  const gallery = (post.journal_images || []).slice().sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="wrap admin-shell admin-shell--narrow">
      <Link href="/admin/jurnal" className="admin-back">&larr; Kembali ke Jurnal</Link>

      <div className="admin-head">
        <div>
          <h1>{post.title}</h1>
          <p className="admin-head__meta">/jurnal/{post.slug}</p>
        </div>
      </div>

      <JournalForm mode="edit" post={post} />
      <JournalImages postId={post.id} coverUrl={post.cover_image} gallery={gallery} />
    </section>
  );
}
