import { supabase } from './supabase';
 
const PLACEHOLDER_IMAGE = 'https://placehold.co/800x1000/EAE7DF/16181B?font=roboto&text=GUDARA';
 
function computeOff(price, comparePrice) {
  if (!comparePrice || comparePrice <= price) return null;
  const pct = Math.round((1 - price / comparePrice) * 100);
  return `${pct}% OFF`;
}
 
function normalizeCard(p) {
  const images = (p.product_images || []).slice().sort((a, b) => a.sort_order - b.sort_order);
  return {
    id: p.id,
    slug: p.slug,
    kat: p.category,
    name: p.name,
    price: p.price,
    old: p.compare_price,
    off: computeOff(p.price, p.compare_price),
    image: images[0]?.url || PLACEHOLDER_IMAGE,
    // Second image (if uploaded) powers the hover-swap effect on product cards.
    hoverImage: images[1]?.url || null,
  };
}
 
// Mirrors renderProductRow(elId, kat, limit) from the prototype's products.js
export async function getProductRow(kat, limit = 8, sort = 'newest') {
  let query = supabase
    .from('products')
    .select('id, slug, name, category, price, compare_price, created_at, product_images(url, sort_order)')
    .eq('is_active', true)
    .limit(limit);
 
  if (kat) query = query.eq('category', kat);
 
  // 'price-asc' / 'price-desc' are ordered in JS below since Supabase can't
  // sort by the effective price (price vs compare_price) in one query pass
  // without a generated column; for a catalog this size, sorting the page
  // in memory after fetch is simpler and just as fast.
  if (sort === 'price-asc' || sort === 'price-desc') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }
 
  const { data, error } = await query;
  if (error) {
    console.error('getProductRow failed:', error.message);
    return [];
  }
  const cards = (data || []).map(normalizeCard);
  if (sort === 'price-asc') return cards.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return cards.sort((a, b) => b.price - a.price);
  return cards;
}
 
// Mirrors PRODUCTS.find(x => x.id === id) on product.html, but keyed by slug
export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, slug, name, category, material_spec, price, compare_price, product_images(url, sort_order), product_variants(id, color, size, stock)'
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
 
  if (error) {
    console.error('getProductBySlug failed:', error.message);
    return null;
  }
 
  const images = (data.product_images || []).slice().sort((a, b) => a.sort_order - b.sort_order);
  const sizes = [...new Set((data.product_variants || []).map((v) => v.size).filter(Boolean))];
  const colors = [...new Set((data.product_variants || []).map((v) => v.color).filter(Boolean))];
  const imageUrls = images.length ? images.map((i) => i.url) : [PLACEHOLDER_IMAGE];
 
  return {
    id: data.id,
    slug: data.slug,
    kat: data.category,
    name: data.name,
    materialSpec: data.material_spec,
    price: data.price,
    old: data.compare_price,
    off: computeOff(data.price, data.compare_price),
    image: imageUrls[0],
    // Full ordered gallery — the PDP shows a thumbnail rail when a product
    // has more than one image, and falls back to a single-image view when
    // it doesn't (most products only have one placeholder for now).
    images: imageUrls,
    // Fall back to the prototype's static S/M/L/XL when a product has no
    // variants seeded yet (seed.sql only seeds variants for basic-tee-man).
    sizes: sizes.length ? sizes : ['S', 'M', 'L', 'XL'],
    colors,
  };
}
 
