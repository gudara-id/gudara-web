// URL dasar situs — dipakai untuk metadataBase, sitemap.xml, robots.txt,
// dan Open Graph (supaya link produk yang dibagikan ke WA/IG dan search
// engine tahu domain aslinya, bukan preview/localhost).
// Override via env var NEXT_PUBLIC_SITE_URL kalau domainnya nanti ganti
// (mis. pindah ke domain sendiri, bukan *.vercel.app lagi).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gudara-web.vercel.app').replace(/\/$/, '');
