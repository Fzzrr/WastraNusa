'use client';

import { RotateCcw, TriangleAlert } from 'lucide-react';
import Link from 'next/link';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1320px] items-center bg-ground px-4 py-16 md:px-6 lg:px-8">
      <section>
        <TriangleAlert
          className="size-12 text-destructive"
          strokeWidth={1.5}
          aria-hidden
        />
        <h1 className="mt-6 text-[clamp(2rem,4vw,3.25rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
          Halaman gagal dimuat
        </h1>
        <p className="mt-3 max-w-md text-lg text-ink-soft">
          Ada masalah saat menampilkan halaman ini. Coba lagi sebentar.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-brand px-6 text-[15px] font-semibold text-on-field transition-colors hover:bg-brand-strong"
          >
            <RotateCcw className="size-4" />
            Coba lagi
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            Beranda
          </Link>
        </div>
      </section>
    </main>
  );
}
