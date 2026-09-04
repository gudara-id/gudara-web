// Katalog bahan baku untuk produk Custom Kits — supaya konsumen punya
// gambaran tekstur/tampilan sebelum konsultasi desain dengan admin.
//
// Ini masih data statis (bukan dari Supabase) karena pilihan bahan pada
// dasarnya sama untuk semua produk custom, jadi tidak perlu diulang per baris
// produk di database. Ganti `image` di bawah dengan URL foto close-up bahan
// asli (upload ke Supabase Storage lalu tempel URL publiknya di sini) begitu
// tersedia — untuk sekarang pakai placeholder supaya halaman tetap tampil.
export const MATERIALS = [
  {
    slug: 'drifit-diadora',
    name: 'Drifit Diadora',
    description:
      'Bahan paling umum untuk jersey printing — ringan, adem, dan permukaannya halus sehingga hasil sublim tajam.',
    image: 'https://placehold.co/400x400/EAE7DF/16181B?font=roboto&text=Drifit+Diadora',
  },
  {
    slug: 'drifit-lotto',
    name: 'Drifit Lotto',
    description:
      'Serat lebih rapat dan sedikit lebih tebal dari Diadora — jatuhnya bagus, tidak menerawang, cocok untuk jersey dengan warna solid gelap.',
    image: 'https://placehold.co/400x400/EAE7DF/16181B?font=roboto&text=Drifit+Lotto',
  },
  {
    slug: 'drifit-hyget',
    name: 'Drifit Hyget',
    description:
      'Punya pori-pori halus mirip mata ayam untuk sirkulasi udara lebih baik — pilihan favorit untuk jersey lapangan/futsal.',
    image: 'https://placehold.co/400x400/EAE7DF/16181B?font=roboto&text=Drifit+Hyget',
  },
  {
    slug: 'drifit-dazzle',
    name: 'Drifit Dazzle',
    description:
      'Permukaan sedikit mengkilap sehingga warna hasil print terlihat lebih vibrant — cocok untuk desain dengan gradasi warna terang.',
    image: 'https://placehold.co/400x400/EAE7DF/16181B?font=roboto&text=Drifit+Dazzle',
  },
  {
    slug: 'mesh',
    name: 'Mesh (Fully Sublim)',
    description:
      'Bahan berlubang paling breathable, biasa dikombinasikan di bagian samping badan atau punggung untuk sirkulasi udara ekstra.',
    image: 'https://placehold.co/400x400/EAE7DF/16181B?font=roboto&text=Mesh',
  },
];
