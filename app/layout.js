import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export const metadata = {
  title: 'GUDARA | Jersey Olahraga & Custom Kits Terbaik Indonesia',
  description:
    'Brand sportswear Indonesia. Jersey olahraga, custom kits, dan pakaian sport berkualitas premium.',
};

// Without this, some mobile browsers lay the page out at a desktop-width
// viewport (~980px) and then either scale-and-crop or scroll it oddly —
// which is what was causing the disproportionate/cut-off mobile rendering.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
