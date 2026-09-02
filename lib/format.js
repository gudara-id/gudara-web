export function formatRp(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}
 
const KATEGORI_LABEL = {
  daily: 'Daily & Casual',
  sport: 'Sport Authentic',
  basic: 'Basic',
  custom: 'Custom Kits',
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

// Ubah teks multi-baris (mis. kolom `care_instructions`) jadi blok terstruktur
// — heading atau daftar poin — supaya bisa dirender rapi (bukan satu paragraf
// panjang menyambung). PENTING: ini cuma memecah berdasarkan baris baru (\n)
// yang SUDAH ADA di teksnya — sengaja tidak coba menebak batas kalimat pakai
// tanda "-", karena tanda itu juga muncul di tengah kata (mis. "CELUP-
// CELUPKAN") dan regex tebak-tebakan berisiko motong teks di tempat yang
// salah. Jadi kalau teks di Supabase diketik/paste TANPA enter di antara tiap
// poin, hasilnya tetap satu paragraf — perlu ditambah jeda baris di
// sumbernya, bukan sesuatu yang bisa "ditebak" otomatis dengan aman di sini.
export function parseTextBlocks(text) {
  if (!text) return [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const blocks = [];
  let currentList = null;

  for (const line of lines) {
    const isBullet = /^[-•]\s*/.test(line);
    const content = line.replace(/^[-•]\s*/, '');
    // Heuristik heading: baris pendek yang TIDAK diawali "-" dan TIDAK
    // diakhiri tanda baca kalimat (. ! ?) — cocok buat baris judul macam
    // "CARA MENCUCI", beda dari baris kalimat/poin yang biasanya diakhiri titik.
    const isHeading = !isBullet && content.length > 0 && content.length <= 60 && !/[.!?]$/.test(content);

    if (isBullet) {
      if (!currentList) {
        currentList = { type: 'list', items: [] };
        blocks.push(currentList);
      }
      currentList.items.push(content);
    } else {
      currentList = null;
      blocks.push({ type: isHeading ? 'heading' : 'text', text: content });
    }
  }
  return blocks;
}
 
