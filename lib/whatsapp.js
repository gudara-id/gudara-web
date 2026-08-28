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
