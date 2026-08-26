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
