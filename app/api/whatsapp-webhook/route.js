// app/api/whatsapp-webhook/route.js
//
// Endpoint ini didaftarkan sebagai "URL Callback" di Meta App Dashboard >
// WhatsApp > Konfigurasi Webhooks.
//
// Environment variable tambahan (.env.local dan Vercel):
//   WHATSAPP_VERIFY_TOKEN=  (string bebas buatan sendiri, mis. hasil `openssl rand -hex 16`)

// 1. GET — dipanggil SEKALI oleh Meta saat Anda klik "Verifikasi dan simpan"
//    di dashboard. Meta kirim hub.verify_token, kita cocokkan dengan
//    WHATSAPP_VERIFY_TOKEN, lalu balikin hub.challenge apa adanya (bukan JSON).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Verifikasi gagal", { status: 403 });
}

// 2. POST — dipanggil setiap ada event: status pesan berubah (terkirim/
//    dibaca/gagal) atau customer membalas chat. Untuk sekarang kita cuma
//    log-nya; nanti bisa dikembangkan (mis. update kolom whatsapp_status
//    di tabel orders berdasarkan message id).
export async function POST(request) {
  const body = await request.json().catch(() => null);
  console.log("WhatsApp webhook event:", JSON.stringify(body));

  // WAJIB selalu balas 200 secepatnya — kalau Meta dapat error atau
  // timeout berkali-kali, webhook subscription bisa otomatis dinonaktifkan.
  return Response.json({ received: true });
}
