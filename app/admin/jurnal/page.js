import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { journalCategoryLabel } from '@/lib/journal';
import { formatDate } from '@/lib/format';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import AdminNav from '@/components/AdminNav';

const TABS = ['all', 'berita', 'event', 'portofolio'];

export const dynamic = 'force-dynamic';

export default async function AdminJournalPage({ searchParams }) {
  const supabase = getSupabaseAdmin();
  const params = await searchParams;
  const filter = params?.category || 'all';

  let query = supabase
    .from('journal_posts')
    .select('id, slug, title, category, cover_image, is_published, event_date, published_at')
    .order('published_at', { ascending: false });

  if (filter !== 'all') query = query.eq('category', filter);

  const { data: posts, error } = await query;

  return (
    <section className="wrap admin-shell">
      <AdminNav />
      <div className="admin-head">
        <div>
          <h1>Jurnal</h1>
          <p className="admin-head__meta">{posts?.length || 0} postingan ditemukan</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/jurnal/baru" className="btn btn--dark" style={{ fontSize: 13 }}>
            + Tambah Postingan
          </Link>
          <AdminLogoutButton />
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map((c) => (
          <Link
            key={c}
            href={`/admin/jurnal?category=${c}`}
            className={`admin-tab${filter === c ? ' is-active' : ''}`}
          >
            {c === 'all' ? 'Semua' : journalCategoryLabel(c)}
          </Link>
        ))}
      </div>

      {error && <p style={{ color: '#C6302B', marginBottom: 16 }}>Gagal memuat data: {error.message}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Tanggal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(posts || []).map((p) => (
              <tr key={p.id}>
                <td>
                  {p.cover_image ? (
                    <img src={p.cover_image} alt="" className="admin-thumb" />
                  ) : (
                    <div className="admin-thumb" />
                  )}
                </td>
                <td>
                  <Link href={`/admin/jurnal/${p.id}`}>{p.title}</Link>
                </td>
                <td>{journalCategoryLabel(p.category)}</td>
                <td>{formatDate(p.event_date || p.published_at)}</td>
                <td>
                  <span className="admin-status">
                    <span className="admin-status__dot" style={{ background: p.is_published ? '#16A34A' : '#9CA3AF' }} />
                    {p.is_published ? 'Terbit' : 'Draft'}
                  </span>
                </td>
              </tr>
            ))}
            {posts?.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">Belum ada postingan pada kategori ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
