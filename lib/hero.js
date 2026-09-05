import { getSupabase } from './supabase';

// Fallback dipakai kalau baris 'home' belum ada di site_hero (mis. migrasi
// SQL belum dijalankan) atau query gagal — beranda tidak boleh sampai
// tampil kosong/error hanya gara-gara hero belum diisi.
const FALLBACK_HERO = {
  eyebrow: 'Move Faster Collection',
  headline: 'MOVE FASTER.',
  description: 'Langkah lebih ringan, sirkulasi udara lebih bebas. Tingkatkan outfit-mu bersama GUDARA.',
  image: '/hero-1.jpg',
  ctaPrimaryLabel: 'Belanja Sekarang',
  ctaPrimaryHref: '/etalase',
  ctaSecondaryLabel: 'Mulai Custom Jersey',
  ctaSecondaryHref: '/custom',
};

function normalizeHero(row) {
  if (!row) return FALLBACK_HERO;
  return {
    eyebrow: row.eyebrow || '',
    headline: row.headline || FALLBACK_HERO.headline,
    description: row.description || '',
    image: row.image_url || FALLBACK_HERO.image,
    ctaPrimaryLabel: row.cta_primary_label || '',
    ctaPrimaryHref: row.cta_primary_href || '',
    ctaSecondaryLabel: row.cta_secondary_label || '',
    ctaSecondaryHref: row.cta_secondary_href || '',
  };
}

// Hero/campaign aktif di beranda. Dipanggil dari app/page.js (client publik,
// jadi pakai anon key + RLS "Public can read hero").
export async function getActiveHero() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('site_hero')
    .select('eyebrow, headline, description, image_url, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href')
    .eq('key', 'home')
    .single();

  if (error) {
    console.error('getActiveHero failed:', error.message);
    return FALLBACK_HERO;
  }
  return normalizeHero(data);
}
