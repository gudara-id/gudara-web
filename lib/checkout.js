// Saklar checkout online. Selama false, semua jalur checkout (halaman
// /checkout, /api/checkout, /api/shipping/rates) dimatikan dan pembeli
// diarahkan pesan via WhatsApp. Ubah jadi true (lalu build ulang) kalau
// Midtrans + Biteship sudah siap dipakai lagi.
export const CHECKOUT_ENABLED = false;

export const WA_NUMBER = '628131648947';

function rp(n) {
  return 'Rp' + Number(n || 0).toLocaleString('id-ID');
}

// Bikin link wa.me berisi rincian isi keranjang supaya admin langsung
// tahu pesanannya tanpa perlu tanya ulang.
export function buildWhatsAppOrderUrl(cart = [], cartTotal = 0) {
  let text;
  if (!cart.length) {
    text = 'Halo Admin Gudara, saya mau pesan produk GUDARA.';
  } else {
    const lines = cart.map(
      (i, idx) =>
        `${idx + 1}. ${i.name}${i.variant ? ` (${i.variant})` : ''} x${i.qty} - ${rp(i.price * i.qty)}`
    );
    text = [
      'Halo Admin Gudara, saya mau pesan:',
      '',
      ...lines,
      '',
      `Subtotal: ${rp(cartTotal)}`,
      '',
      'Mohon info ongkir dan cara pembayarannya ya.',
    ].join('\n');
  }
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
