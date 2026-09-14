import { SITE_URL } from '@/lib/site';

// Next.js otomatis meng-generate /robots.txt dari file ini.
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /admin & /api tidak untuk diindeks — itu panel admin & endpoint
      // backend, bukan halaman yang relevan buat hasil pencarian.
      // /keranjang & /checkout juga tidak diindeks — isinya kosong/spesifik
      // per sesi pengunjung (bukan konten yang sama buat semua orang), jadi
      // cuma jadi halaman duplikat/kosong di hasil pencarian kalau diindeks.
      disallow: ['/admin', '/api', '/keranjang', '/checkout'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
