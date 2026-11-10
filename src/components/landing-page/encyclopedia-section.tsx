'use client';

import { LANDING_ARTICLE_LIMIT, useArticles } from '@/hooks/use-article';
import { ArrowRight, ImageOff, MapPin, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function EncyclopediaSection() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const { data, error, isPending } = useArticles(1, LANDING_ARTICLE_LIMIT);
  const latestArticles = data?.items.slice(0, 3) ?? [];
  const stats = data?.meta.stats;
  const figures = stats
    ? [
        { value: stats.totalArticles, label: 'artikel' },
        { value: stats.totalWastraTypes, label: 'jenis wastra' },
        { value: stats.totalProvinces, label: 'provinsi' },
      ]
    : [];

  return (
    <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
      <div className="grid bg-field text-on-field lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col p-6 md:p-12">
          <h2 className="text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-semibold tracking-[-0.02em]">
            Ensiklopedia wastra
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-on-field-soft sm:text-lg">
            Asal-usul, motif, dan makna di balik setiap kain Nusantara.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              const query = searchValue.trim();
              router.push(
                query
                  ? `/encyclopedia?search=${encodeURIComponent(query)}`
                  : '/encyclopedia',
              );
            }}
            role="search"
            className="mt-8 flex max-w-lg items-center rounded-full bg-white/10 p-1 transition-colors focus-within:bg-white/15 focus-within:outline-2 focus-within:outline-gold/60"
          >
            <input
              className="h-11 min-w-0 flex-1 bg-transparent pl-5 text-base text-on-field outline-none placeholder:text-on-field-soft [&::-webkit-search-cancel-button]:hidden"
              placeholder="Motif, kain, atau daerah"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              aria-label="Cari artikel ensiklopedia"
            />
            <button
              type="submit"
              aria-label="Cari"
              title="Cari"
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-gold text-ink transition-colors hover:bg-gold active:scale-95"
            >
              <Search className="size-[18px]" strokeWidth={2} />
            </button>
          </form>

          {figures.length > 0 ? (
            <dl className="mt-auto flex flex-wrap gap-x-10 gap-y-4 pt-10">
              {figures.map((figure) => (
                <div key={figure.label}>
                  <dt className="sr-only">{figure.label}</dt>
                  <dd className="text-[clamp(2rem,3.4vw,2.75rem)] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                    {figure.value}
                  </dd>
                  <dd className="mt-1.5 text-[15px] text-on-field-soft">
                    {figure.label}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="bg-black/15 p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Terbaru</h3>
            <Link
              href="/encyclopedia"
              aria-label="Semua artikel"
              title="Semua artikel"
              className="grid size-11 place-items-center rounded-full text-on-field transition-colors hover:bg-white/10"
            >
              <ArrowRight className="size-5" strokeWidth={1.75} />
            </Link>
          </div>

          <ul className="mt-4 space-y-1">
            {isPending
              ? Array.from({ length: 3 }).map((_, index) => (
                  <li key={index} className="flex items-center gap-4 py-2">
                    <span className="size-16 shrink-0 animate-pulse bg-white/10" />
                    <span className="h-4 w-2/3 animate-pulse bg-white/10" />
                  </li>
                ))
              : null}

            {!isPending && error ? (
              <li className="py-2 text-[15px] text-on-field-soft">
                Gagal memuat artikel.
              </li>
            ) : null}

            {!isPending && !error
              ? latestArticles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/encyclopedia/${article.slug}`}
                      className="group -mx-2 flex items-center gap-4 p-2 transition-colors hover:bg-white/5"
                    >
                      <span className="relative size-16 shrink-0 overflow-hidden bg-white/10">
                        {article.imageURL ? (
                          <Image
                            src={article.imageURL}
                            alt=""
                            fill
                            className="object-cover transition duration-500 ease-out group-hover:scale-110"
                            sizes="64px"
                          />
                        ) : (
                          <ImageOff
                            className="absolute inset-0 m-auto size-5 text-on-field-soft"
                            strokeWidth={1.5}
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-base leading-snug font-medium group-hover:underline group-hover:underline-offset-4">
                          {article.title}
                        </span>
                        {article.region ? (
                          <span className="mt-1 flex items-center gap-1 text-[13px] text-on-field-soft">
                            <MapPin
                              className="size-3.5 shrink-0"
                              strokeWidth={1.75}
                            />
                            <span className="truncate">{article.region}</span>
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))
              : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
