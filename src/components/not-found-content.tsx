import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/** 404 body, shared by the root page and the public layout (which already renders Header/Footer). */
export function NotFoundContent() {
  return (
    <main className="mx-auto grid w-full max-w-[1320px] flex-1 items-center gap-12 px-4 py-16 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:px-8">
      <section>
        <p
          aria-hidden
          className="text-[clamp(6rem,18vw,14rem)] leading-none font-semibold tracking-[-0.06em] text-brand"
        >
          404
        </p>
        <h1 className="mt-4 text-[clamp(2rem,3.4vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 max-w-md text-lg text-ink-soft">
          Mungkin sudah dipindahkan. Lanjutkan dari salah satu tautan ini.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full bg-brand px-6 text-[15px] font-semibold text-on-field transition-colors hover:bg-brand-strong"
          >
            Beranda
          </Link>
          {[
            { href: '/catalog', label: 'Katalog' },
            { href: '/encyclopedia', label: 'Ensiklopedia' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group inline-flex h-12 items-center gap-1.5 rounded-full px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-surface"
            >
              {link.label}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <div className="relative hidden aspect-[4/5] w-full max-w-[520px] justify-self-end overflow-hidden bg-surface lg:block">
        <Image
          src="/auth-cover.jpg"
          alt=""
          fill
          sizes="(min-width: 1024px) 560px, 0px"
          style={{ objectPosition: '70% 10%' }}
          className="object-cover"
        />
      </div>
    </main>
  );
}
