'use client';

import { Home, RotateCcw, TriangleAlert } from 'lucide-react';
import Link from 'next/link';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1320px] items-center px-4 py-16 md:px-6 lg:px-8">
      <section className="w-full rounded-3xl border border-[#d7cfbd] bg-[#f9f6ee] p-8 shadow-[0_20px_50px_-30px_rgba(45,79,63,0.45)] md:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e6cfc4] bg-[#f8ece6] px-4 py-1.5 text-sm font-semibold text-[#8a3b22]">
          <TriangleAlert className="h-4 w-4" />
          Terjadi Kesalahan
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#254838] md:text-4xl">
          Halaman gagal dimuat
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#446957] md:text-lg">
          Maaf, ada masalah saat menampilkan halaman ini. Silakan coba lagi,
          atau kembali ke beranda.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2f5f49] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#244838]"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[#bfcfbe] bg-white px-5 py-3 text-sm font-semibold text-[#2d4f3f] transition hover:bg-[#f1f6f2]"
          >
            <Home className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </section>
    </main>
  );
}
