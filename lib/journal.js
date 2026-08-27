import { getSupabase } from './supabase';

const PLACEHOLDER_COVER = 'https://placehold.co/1200x675/16181B/EAE7DF?font=roboto&text=GUDARA';

const CATEGORY_LABEL = {
  berita: 'Berita',
  event: 'Event',
  portofolio: 'Portofolio',
};

export function journalCategoryLabel(cat) {
  return CATEGORY_LABEL[cat] || cat;
}

function normalizePost(p) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    excerpt: p.excerpt,
    content: p.content,
    cover: p.cover_image || PLACEHOLDER_COVER,
    eventDate: p.event_date,
    publishedAt: p.published_at,
  };
}

// Daftar postingan jurnal, terbaru duluan. `category` opsional untuk filter
// ('berita' | 'event' | 'portofolio').
export async function getJournalPosts(category, limit = 12) {
  const supabase = getSupabase();
  let query = supabase
    .from('journal_posts')
    .select('id, slug, title, category, excerpt, cover_image, event_date, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    console.error('getJournalPosts failed:', error.message);
    return [];
  }
  return (data || []).map(normalizePost);
}

// Satu postingan lengkap + galeri foto tambahan (kalau ada), dicari by slug.
export async function getJournalPostBySlug(slug) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('journal_posts')
    .select('id, slug, title, category, excerpt, content, cover_image, event_date, published_at, journal_images(url, caption, sort_order)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('getJournalPostBySlug failed:', error.message);
    return null;
  }

  const gallery = (data.journal_images || [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({ url: img.url, caption: img.caption }));

  return { ...normalizePost(data), gallery };
}
