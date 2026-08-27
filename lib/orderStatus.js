export const STATUS_META = {
  pending_payment: { label: 'Menunggu Bayar', color: '#D97706' },
  paid: { label: 'Sudah Dibayar', color: '#2563EB' },
  processing: { label: 'Diproses', color: '#7C3AED' },
  shipped: { label: 'Dikirim', color: '#0891B2' },
  completed: { label: 'Selesai', color: '#16A34A' },
  cancelled: { label: 'Dibatalkan', color: '#DC2626' },
  expired: { label: 'Kedaluwarsa', color: '#6B7280' },
};
 
export function statusMeta(status) {
  return STATUS_META[status] || { label: status, color: '#6B7280' };
}
 
