'use client';

import { getSupabase } from './supabase';

// Id sesi sederhana biar bisa hitung sesi unik, tanpa perlu login.
// sessionStorage (bukan localStorage) supaya reset tiap sesi tab baru —
// cukup untuk analitik related-products, bukan untuk fitur yang butuh
// identitas persisten.
function getSessionId() {
  if (typeof window === 'undefined') return null;
  const KEY = 'gudara_session_id';
  let id = window.sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(KEY, id);
  }
  return id;
}

// Dipakai section "Kamu Mungkin Juga Suka" untuk mencatat view/click/add-to-cart
// pada produk terkait. Gagal diam-diam (fire-and-forget) — tracking tidak
// boleh pernah mengganggu pengalaman belanja.
export async function logProductEvent(eventType, sourceProductId, targetProductId) {
  try {
    const supabase = getSupabase();
    await supabase.from('product_events').insert({
      event_type: eventType,
      source_product_id: sourceProductId || null,
      target_product_id: targetProductId,
      session_id: getSessionId(),
    });
  } catch (err) {
    console.error('Gagal mencatat product event:', err?.message);
  }
}
