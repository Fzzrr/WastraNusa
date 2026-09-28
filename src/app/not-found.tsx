import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Compass, Home, Library, PackageSearch } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f3ec] text-[#2d4f3f]">
      <Header homeHref="/" />

      <main className="mx-auto flex w-full max-w-[1320px] flex-1 items-center px-4 py-16 md:px-6 lg:px-8">
        <section className="w-full rounded-3xl border border-[#d7cfbd] bg-[#f9f6ee] p-8 shadow-[0_20px_50px_-30px_rgba(45,79,63,0.45)] md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cdd8ce] bg-[#edf3ee] px-4 py-1.5 text-sm font-semibold text-[#2f5f49]">
            <Compass className="h-4 w-4" />
            Halaman Tidak Ditemukan
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#254838] md:text-5xl">
            404
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#446957] md:text-lg">
            Maaf, halaman yang Anda cari tidak tersedia atau mungkin sudah
            dipindahkan. Silakan lanjutkan eksplorasi budaya wastra dari halaman
            utama.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2f5f49] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#244838]"
            >
              <Home className="h-4 w-4" />
              Kembali ke Beranda
            </Link>

            <Link
              href="/encyclopedia"
              className="inline-flex items-center gap-2 rounded-xl border border-[#bfcfbe] bg-white px-5 py-3 text-sm font-semibold text-[#2d4f3f] transition hover:bg-[#f1f6f2]"
            >
              <Library className="h-4 w-4" />
              Buka Ensiklopedia
            </Link>

            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-xl border border-[#bfcfbe] bg-white px-5 py-3 text-sm font-semibold text-[#2d4f3f] transition hover:bg-[#f1f6f2]"
            >
              <PackageSearch className="h-4 w-4" />
              Jelajahi Katalog Produk
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
