import { getSupabase } from './supabase';

export async function getApprovedReviews(productId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('product_reviews')
    .select('id, reviewer_name, rating, comment, created_at')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getApprovedReviews failed:', error.message);
    return [];
  }
  return data || [];
}

// { average: 4.5, count: 12 } — dipakai di badge rating deket harga produk
// dan di header section review.
export function reviewSummary(reviews) {
  if (!reviews || !reviews.length) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
