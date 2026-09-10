// Notifikasi email untuk perubahan status pesanan, lewat Resend
// (https://resend.com). Butuh env var RESEND_API_KEY — kalau belum di-set,
// atau customer tidak punya email tersimpan, fungsi ini skip diam-diam
// (return null) supaya tidak pernah menggagalkan update status di admin.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "GUDARA <no-reply@gudara.id>";

const STATUS_COPY = {
  processing: {
    subject: "Pesananmu sedang diproses — GUDARA",
    body: (o) => `Pesanan <strong>${o.orderNumber}</strong> kamu sedang diproses oleh tim kami.`,
  },
  shipped: {
    subject: "Pesananmu sudah dikirim — GUDARA",
    body: (o) =>
      `Pesanan <strong>${o.orderNumber}</strong> sudah dikirim.` +
      (o.waybill ? ` Nomor resi: <strong>${o.waybill}</strong>.` : ""),
  },
  completed: {
    subject: "Pesananmu sudah selesai — GUDARA",
    body: (o) => `Pesanan <strong>${o.orderNumber}</strong> sudah selesai. Terima kasih sudah belanja di GUDARA!`,
  },
  cancelled: {
    subject: "Pesananmu dibatalkan — GUDARA",
    body: (o) => `Pesanan <strong>${o.orderNumber}</strong> dibatalkan. Hubungi admin kalau ini tidak sesuai dugaan.`,
  },
};

export async function sendOrderStatusEmail({ to, customerName, orderNumber, status, waybill }) {
  if (!RESEND_API_KEY || !to) return null;
  const copy = STATUS_COPY[status];
  if (!copy) return null;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: copy.subject,
      html: `<p>Halo ${customerName},</p><p>${copy.body({ orderNumber, waybill })}</p>`,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `Resend API error (${res.status})`);
  }
  return res.json();
}
