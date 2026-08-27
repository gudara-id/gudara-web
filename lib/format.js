export function formatRp(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}
 
const KATEGORI_LABEL = {
  daily: 'Daily & Casual',
  sport: 'Sport Authentic',
  basic: 'Basic',
};
 
export function titleCase(kat) {
  return KATEGORI_LABEL[kat] || kat;
}
 
// Ubah teks material_spec (dipisah baris baru, koma, atau tanda "-") jadi
// daftar poin fitur, meniru gaya bullet-list di halaman produk referensi.
// Kalau teksnya cuma satu kalimat pendek tanpa pemisah, dikembalikan null
// supaya caller bisa fallback ke paragraf biasa.
export function toFeatureList(spec) {
  if (!spec) return null;
  const parts = spec
    .split(/\n|(?<=[a-z0-9])\s*[-•]\s+|,\s*(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;
  return parts;
}
 
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
 
