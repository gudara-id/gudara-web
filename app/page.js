export const dynamic = 'force-dynamic';
 
import Link from 'next/link';
import { getProductRow } from '@/lib/products';
import ProductGrid from '@/components/ProductGrid';
 
export default async function HomePage() {
  const [rowDaily, rowSport, rowBasic] = await Promise.all([
    getProductRow('daily', 4),
    getProductRow('sport', 4),
    getProductRow('basic', 2),
  ]);
 
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div
          className="hero__bg"
          style={{ backgroundImage: "url('https://gudara.id/cover-web-1.jpg')" }}
        />
        <div className="wrap hero__content">
          <span className="eyebrow" style={{ color: '#fff' }}>Move Faster Collection</span>
          <h1>MOVE<br />FASTER.</h1>
          <p>Langkah lebih ringan, sirkulasi udara lebih bebas. Tingkatkan outfit-mu bersama GUDARA.</p>
          <div className="hero__ctas">
            <Link href="/etalase" className="btn btn--accent">Belanja Sekarang</Link>
            <Link href="/custom" className="btn btn--outline">Mulai Custom Jersey</Link>
          </div>
        </div>
