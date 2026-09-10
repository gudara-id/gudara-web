const WHATSAPP_API_VERSION = "v20.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

// Ubah nomor HP customer (08xx / +628xx / 628xx) ke format yang diminta
// WhatsApp Cloud API: awalan negara tanpa "+", contoh "6281234567890".
function toWhatsAppNumber(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return "62" + digits;
}

async function sendWhatsAppRequest(payload) {
  const res = await fetch(
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `WhatsApp API error (${res.status})`);
  }
  return data;
}

// Kirim template "konfirmasi_pesanan" — wajib pakai template karena ini
// pesan pertama dari bisnis ke customer (business-initiated message).
// Urutan params HARUS sama persis dengan urutan {{1}}, {{2}}, {{3}} di template.
export async function sendOrderConfirmation({ phone, customerName, orderNumber, totalFormatted }) {
  return sendWhatsAppRequest({
    messaging_product: "whatsapp",
    to: toWhatsAppNumber(phone),
    type: "template",
    template: {
      name: process.env.WHATSAPP_TEMPLATE_NAME || "pesanan",
      language: { code: "id" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: customerName },
            { type: "text", text: orderNumber },
            { type: "text", text: totalFormatted },
          ],
        },
      ],
    },
  });
}

// Nama template WhatsApp untuk tiap status pesanan (selain 'paid', yang
// sudah ditangani sendOrderConfirmation di atas). PENTING: template-template
// ini ("pesanan_diproses" dst.) belum tentu ada — harus dibuat & disetujui
// dulu di Meta Business Manager (WhatsApp Manager > Message Templates)
// sebelum fitur ini benar-benar terkirim, sama seperti template "pesanan"
// yang dipakai sendOrderConfirmation. Nama bisa dioverride lewat env var
// kalau nama template approved-mu beda dari default di bawah.
const STATUS_TEMPLATE_NAME = {
  processing: process.env.WHATSAPP_TEMPLATE_PROCESSING || "pesanan_diproses",
  shipped: process.env.WHATSAPP_TEMPLATE_SHIPPED || "pesanan_dikirim",
  completed: process.env.WHATSAPP_TEMPLATE_COMPLETED || "pesanan_selesai",
  cancelled: process.env.WHATSAPP_TEMPLATE_CANCELLED || "pesanan_dibatalkan",
};

// Kirim notifikasi WA saat admin mengubah status pesanan (diproses/dikirim/
// selesai/dibatalkan). `extra` opsional dipakai untuk nomor resi saat status
// 'shipped'. Kalau status tidak punya template terdaftar, fungsi ini
// langsung return null tanpa memanggil API (skip diam-diam).
export async function sendOrderStatusUpdate({ phone, customerName, orderNumber, status, extra }) {
  const templateName = STATUS_TEMPLATE_NAME[status];
  if (!templateName) return null;

  const parameters = [
    { type: "text", text: customerName },
    { type: "text", text: orderNumber },
  ];
  if (extra) parameters.push({ type: "text", text: extra });

  return sendWhatsAppRequest({
    messaging_product: "whatsapp",
    to: toWhatsAppNumber(phone),
    type: "template",
    template: {
      name: templateName,
      language: { code: "id" },
      components: [{ type: "body", parameters }],
    },
  });
}
