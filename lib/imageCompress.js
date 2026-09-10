'use client';

// Kompres & resize foto di browser SEBELUM diupload — jadi ukuran file
// yang naik ke server (dan yang harus didownload pengunjung toko) selalu
// kecil, tanpa admin perlu mikirin ukuran foto dari HP-nya sendiri.
// Mirip cara Shopee/TikTok Shop otomatis mengecilkan foto saat upload.

const MAX_DIMENSION = 1600; // sisi terpanjang, px — cukup tajam untuk galeri produk
const JPEG_QUALITY = 0.82;
const TARGET_MAX_BYTES = 600 * 1024; // target ~600KB per foto setelah kompresi

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => resolve({ img, url });
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Resize gambar supaya sisi terpanjang maksimal MAX_DIMENSION, lalu
 * kompres ke JPEG. Kalau hasilnya masih di atas TARGET_MAX_BYTES, coba
 * turunkan kualitas bertahap. GIF dilewati apa adanya (animasi bisa rusak
 * kalau digambar ulang ke canvas).
 *
 * Return: { file, originalSize, compressedSize }
 */
export async function compressImage(file) {
  if (!file || !file.type?.startsWith('image/')) return { file, originalSize: file?.size || 0, compressedSize: file?.size || 0 };
  if (file.type === 'image/gif') return { file, originalSize: file.size, compressedSize: file.size };

  let img, url;
  try {
    ({ img, url } = await loadImage(file));
  } catch {
    return { file, originalSize: file.size, compressedSize: file.size };
  }

  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    let quality = JPEG_QUALITY;
    let blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    let attempts = 0;
    while (blob && blob.size > TARGET_MAX_BYTES && quality > 0.45 && attempts < 4) {
      quality -= 0.12;
      blob = await canvasToBlob(canvas, 'image/jpeg', quality);
      attempts += 1;
    }

    if (!blob || blob.size >= file.size) {
      // Kompresi tidak membantu (mis. file sudah kecil) — pakai file asli.
      return { file, originalSize: file.size, compressedSize: file.size };
    }

    const newName = file.name.replace(/\.[a-z0-9]+$/i, '') + '.jpg';
    const compressedFile = new File([blob], newName, { type: 'image/jpeg' });
    return { file: compressedFile, originalSize: file.size, compressedSize: compressedFile.size };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
