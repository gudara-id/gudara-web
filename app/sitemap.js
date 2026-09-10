import { getSupabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/site';

// Next.js otomatis meng-generate /sitemap.xml dari file ini (App Router
// metadata file convention) — tidak perlu route handler manual.
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
export default async function sitemap() {
  const supabase = getSupabase();

  const staticRoutes = ['', '/etalase', '/custom', '/tentang', '/jurnal', '/lacak'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at')
    .eq('is_active', true);

  const productRoutes = (products || []).map((p) => ({
    url: `${SITE_URL}/produk/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
  }));

  const { data: posts } = await supabase
    .from('journal_posts')
    .select('slug, published_at')
    .eq('is_published', true);

  const journalRoutes = (posts || []).map((p) => ({
    url: `${SITE_URL}/jurnal/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : new Date(),
  }));

  return [...staticRoutes, ...productRoutes, ...journalRoutes];
}
