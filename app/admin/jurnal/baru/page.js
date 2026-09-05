import Link from 'next/link';
import JournalForm from '@/components/JournalForm';

export default function AdminNewJournalPage() {
  return (
    <section className="wrap admin-shell admin-shell--narrow">
      <Link href="/admin/jurnal" className="admin-back">&larr; Kembali ke Jurnal</Link>

      <div className="admin-head">
        <div>
          <h1>Tambah Postingan</h1>
          <p className="admin-head__meta">Foto cover dan galeri bisa ditambahkan setelah postingan dibuat.</p>
        </div>
      </div>

      <JournalForm mode="create" />
    </section>
  );
}
