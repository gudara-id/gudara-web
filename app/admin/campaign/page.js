import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import AdminNav from '@/components/AdminNav';
import HeroForm from '@/components/HeroForm';

export const dynamic = 'force-dynamic';

export default async function AdminCampaignPage() {
  const supabase = getSupabaseAdmin();
  const { data: hero, error } = await supabase
    .from('site_hero')
    .select('*')
    .eq('key', 'home')
    .single();

  return (
    <section className="wrap admin-shell admin-shell--narrow">
      <AdminNav />
      <div className="admin-head">
        <div>
          <h1>Campaign / Hero Beranda</h1>
          <p className="admin-head__meta">Atur foto & teks utama yang tampil paling atas di halaman beranda.</p>
        </div>
        <AdminLogoutButton />
      </div>

      {error && (
        <p style={{ color: '#C6302B', marginBottom: 16 }}>
          Gagal memuat data: {error.message}. Pastikan migrasi SQL "site_hero" sudah dijalankan di Supabase.
        </p>
      )}

      {!error && <HeroForm hero={hero} />}
    </section>
  );
}
