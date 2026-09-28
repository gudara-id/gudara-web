import { redirect } from 'next/navigation';
import { CHECKOUT_ENABLED } from '@/lib/checkout';
import CheckoutClient from './CheckoutClient';

export default function CheckoutPage() {
  // Checkout online dimatikan sementara: arahkan ke keranjang, di sana
  // pembeli memesan lewat WhatsApp.
  if (!CHECKOUT_ENABLED) redirect('/keranjang');
  return <CheckoutClient />;
}
