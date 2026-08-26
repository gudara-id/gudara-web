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
  };
}

// Mirrors renderProductRow(elId, kat, limit) from the prototype's products.js
export async function getProductRow(kat, limit = 8) {
  let query = supabase
    .from('products')
    .select('id, slug, name, category, price, compare_price, product_images(url, sort_order)')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (kat) query = query.eq('category', kat);

  const { data, error } = await query;
  if (error) {
    console.error('getProductRow failed:', error.message);
    return [];
  }
  return (data || []).map(normalizeCard);
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

  return {
    id: data.id,
    slug: data.slug,
    kat: data.category,
    name: data.name,
    materialSpec: data.material_spec,
    price: data.price,
    old: data.compare_price,
    off: computeOff(data.price, data.compare_price),
    image: images[0]?.url || PLACEHOLDER_IMAGE,
    // Fall back to the prototype's static S/M/L/XL when a product has no
    // variants seeded yet (seed.sql only seeds variants for basic-tee-man).
    sizes: sizes.length ? sizes : ['S', 'M', 'L', 'XL'],
    colors,
  };
}
