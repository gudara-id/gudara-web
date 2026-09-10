import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { SITE_URL } from '@/lib/site';

const SITE_TITLE = 'GUDARA | Jersey Olahraga & Custom Kits Terbaik Indonesia';
const SITE_DESCRIPTION =
  'Brand sportswear Indonesia. Jersey olahraga, custom kits, dan pakaian sport berkualitas premium.';

export const metadata = {
  // metadataBase bikin semua URL relatif (termasuk openGraph.images di
  // generateMetadata masing-masing halaman) otomatis jadi URL absolut ke
  // domain situs — tanpa ini, preview link WA/IG/Twitter bisa gagal
  // menampilkan foto karena URL-nya tidak lengkap.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: 'GUDARA',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
