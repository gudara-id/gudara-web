/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Foto produk disimpan di Supabase Storage (bucket public) dan diambil
    // langsung dari URL publiknya (lihat lib/products.js) — pola hostname-nya
    // selalu "<project-ref>.supabase.co", jadi wildcard di sini supaya tetap
    // jalan walau ganti project atau pindah environment (dev/preview/prod).
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'placehold.co' }, // fallback placeholder waktu produk belum ada foto
    ],
    // Next akan generate ukuran-ukuran ini otomatis (WebP/AVIF, di-resize &
    // di-cache oleh Vercel) — ini yang bikin foto tidak lagi loading lambat,
    // karena browser tidak lagi download file kamera ukuran penuh (bisa
    // beberapa MB) tiap kali, cukup versi yang sudah dikecilkan sesuai layar.
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600],
    imageSizes: [76, 128, 256, 384],
  },
};

export default nextConfig;
