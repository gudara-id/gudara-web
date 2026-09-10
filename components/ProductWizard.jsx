'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductForm from '@/components/ProductForm';
import ProductImages from '@/components/ProductImages';
import ProductVariants from '@/components/ProductVariants';

const STEPS = [
  { key: 'info', label: 'Info Produk' },
  { key: 'foto', label: 'Foto' },
  { key: 'varian', label: 'Varian & Stok' },
];

export default function ProductWizard() {
  const [product, setProduct] = useState(null); // { id, slug, name, category }
  const [step, setStep] = useState('info');

  function handleCreated(created) {
    setProduct(created);
    setStep('foto');
  }

  function goTo(key) {
    // Belum bisa buka Foto/Varian sebelum produk dibuat di langkah 1.
    if (!product && key !== 'info') return;
    setStep(key);
  }

  return (
    <div>
      <div className="admin-wizard-steps">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={`admin-wizard-step${step === s.key ? ' is-active' : ''}${product || i === 0 ? ' is-enabled' : ''}`}
            onClick={() => goTo(s.key)}
            disabled={!product && s.key !== 'info'}
          >
            <span className="admin-wizard-step__num">{i + 1}</span>
            {s.label}
          </button>
        ))}
      </div>

      {step === 'info' && (
        <ProductForm mode="create" onCreated={handleCreated} submitLabel="Lanjut: Tambah Foto →" />
      )}

      {step === 'foto' && product && (
        <>
          <p className="admin-wizard-hint">
            <strong>{product.name}</strong> sudah tersimpan sebagai draft. Sekarang tambahkan foto produknya.
          </p>
          <ProductImages productId={product.id} images={[]} colors={[]} />
          <div className="admin-wizard-nav">
            <button type="button" className="btn btn--outline" style={{ color: 'var(--ink)', borderColor: 'var(--ink)' }} onClick={() => setStep('varian')}>
              Lanjut: Varian &amp; Stok →
            </button>
          </div>
        </>
      )}

      {step === 'varian' && product && (
        <>
          <p className="admin-wizard-hint">
            Atur warna, ukuran, dan stok — sama seperti mengisi variasi produk di Shopee/TikTok Shop. Kalau produk ini cuma satu ukuran, isi Ukuran saja dan kosongkan Warna.
          </p>
          <ProductVariants productId={product.id} variants={[]} basePrice={0} />
          <div className="admin-wizard-nav">
            <Link href={`/admin/produk/${product.id}`} className="btn btn--dark">
              Selesai — Lihat &amp; Lengkapi Produk
            </Link>
            <Link href="/admin/produk" className="btn btn--outline" style={{ color: 'var(--ink)', borderColor: 'var(--ink)' }}>
              Selesai — Kembali ke Daftar Produk
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
