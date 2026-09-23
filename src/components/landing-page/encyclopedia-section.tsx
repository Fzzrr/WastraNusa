'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useArticles } from '@/hooks/use-article';
import { ChevronRight, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export interface HomepageArticlePreview {
  slug: string;
  category: string;
  title: string;
  meta: string;
  imageURL?: string | null;
}

export function EncyclopediaSection() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const { data, error, isPending } = useArticles(1, 2);
  const islandFilters =
    data?.meta.islands.filter((island) => island.name !== 'Semua Pulau') ?? [];
  const popularTags = islandFilters.slice(0, 5);
  const popularTopics = data?.meta.topics.slice(0, 5) ?? [];
  const latestArticles: HomepageArticlePreview[] =
    data?.items.map((article) => ({
      slug: article.slug,
      category: article.motifLabel,
      title: article.title,
      meta: article.region,
      imageURL: article.imageURL,
    })) ?? [];

  const asideRef = useRef<HTMLElement | null>(null);
  const sampleRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(
    Math.min(2, latestArticles.length),
  );

  useEffect(() => {
    function compute() {
      const aside = asideRef.current;
      const sample = sampleRef.current;
      if (!aside || !sample) return;

      const asideH = aside.clientHeight;
      const header = aside.querySelector('h4');
      const headerH = header ? (header as HTMLElement).offsetHeight : 0;
      const footer = aside.querySelector('.mt-5');
      const footerH = footer ? (footer as HTMLElement).offsetHeight : 0;

      const sampleRect = sample.getBoundingClientRect();
      const cardH = sampleRect.height || 96;
      const gap = 12; // approx space-y-3

      const available = Math.max(0, asideH - headerH - footerH - 24);
      const count = Math.floor((available + gap) / (cardH + gap));
      const finalCount = Math.max(
        1,
        Math.min(latestArticles.length, count || 1),
      );
      setVisibleCount(finalCount);
    }

    compute();
    const ro = new ResizeObserver(() => compute());
    if (asideRef.current) ro.observe(asideRef.current);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [latestArticles.length]);

  return (
    <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl bg-[#2f5e48] text-[#edf3e8] shadow-[0_30px_50px_-35px_rgba(15,41,28,0.85)]">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="p-6 md:p-10">
            <Badge
              variant="outline"
              className="inline-flex rounded-lg border-white/20 bg-white/7 px-3 py-1 text-xs font-semibold text-[#d8e2d4]"
            >
              Ensiklopedia Budaya
            </Badge>

            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#f2f8ee]">
              Jelajahi Kekayaan Wastra Nusantara
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#bed0c4]">
              Pakaian adat adalah busana tradisional yang mencerminkan identitas
              dan budaya suatu daerah. Indonesia memiliki ratusan jenis pakaian
              adat dari berbagai suku dan provinsi, masing-masing dengan
              keunikan motif, bahan, dan makna simbolis yang mendalam.
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
              className="mt-5 flex max-w-xl items-center overflow-hidden rounded-xl border border-white/15 bg-[#254d3a] transition-all duration-300 focus-within:border-white/35 focus-within:bg-[#21473590] focus-within:shadow-[0_0_0_4px_rgba(213,200,179,0.12)]"
            >
              <Search className="ml-4 h-4 w-4 text-[#b7cdbf]" />
              <Input
                className="h-12 w-full border-0 bg-transparent px-3 text-sm text-[#ebf3e7] placeholder:text-[#95b19f] focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Cari artikel budaya, motif, atau provinsi..."
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                aria-label="Cari artikel ensiklopedia"
              />
              <Button
                type="submit"
                className="inline-flex h-12 items-center bg-[#d5c8b3] px-6 text-sm font-bold text-[#2d5f48] transition hover:bg-[#e6dccc] active:scale-95"
              >
                Cari
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#b1c4b5]">Filter Pulau :</span>
              {popularTags.map((tag) => (
                <Button
                  key={tag.name}
                  asChild
                  className="rounded-full border border-white/18 bg-white/8 px-3 py-1.5 font-semibold text-[#d2dfd2] transition hover:scale-105 hover:border-white/35 hover:bg-white/14 active:scale-95"
                >
                  <Link
                    href={`/encyclopedia?island=${encodeURIComponent(tag.name)}`}
                  >
                    {tag.name}
                  </Link>
                </Button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#b1c4b5]">Filter Topik :</span>
              {popularTopics.map((topic) => (
                <Button
                  key={topic}
                  asChild
                  className="rounded-full border border-white/18 bg-white/8 px-3 py-1.5 font-semibold text-[#d2dfd2] transition hover:scale-105 hover:border-white/35 hover:bg-white/14 active:scale-95"
                >
                  <Link
                    href={`/encyclopedia?topic=${encodeURIComponent(topic)}`}
                  >
                    {topic}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <aside
            ref={asideRef}
            className="border-t border-white/12 bg-[#2a5541] p-5 md:p-6 lg:border-l lg:border-t-0"
          >
            <h4 className="text-lg font-bold tracking-tight text-[#f0f7eb]">
              Artikel Terkini
            </h4>

            {/* sample card used for measuring height (hidden, offscreen) */}
            <div
              ref={sampleRef}
              style={{
                position: 'absolute',
                visibility: 'hidden',
                pointerEvents: 'none',
                left: '-9999px',
              }}
            >
              <Card className="rounded-2xl border border-white/6 bg-white/7 p-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg bg-white/10" />
                  <div className="flex-1">
                    <div className="h-5 w-3/4 rounded bg-white/10" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-white/10" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6 space-y-3">
              {isPending
                ? Array.from({ length: 2 }).map((_, index) => (
                    <Card
                      key={index}
                      className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/7 p-3.5"
                    >
                      <div className="h-14 w-14 shrink-0 rounded-lg border border-white/10 bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-white/10" />
                        <div className="h-3 w-1/2 rounded bg-white/10" />
                        <div className="h-5 w-16 rounded bg-white/10" />
                      </div>
                    </Card>
                  ))
                : null}

              {!isPending && error ? (
                <Card className="rounded-xl border border-white/6 bg-white/7 p-4 text-sm text-[#dbe5d8]">
                  Gagal memuat artikel terkini.
                </Card>
              ) : null}

              {!isPending && !error && latestArticles.length > 0
                ? latestArticles.slice(0, visibleCount).map((article) => (
                    <Link
                      key={article.slug}
                      href={`/encyclopedia/${article.slug}`}
                      className="block"
                    >
                      <Card className="group rounded-2xl border border-white/6 bg-white/7 p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/11">
                        <div className="flex items-center gap-4">
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-white/10 bg-[radial-gradient(circle_at_35%_35%,rgba(248,234,210,.18)_0%,rgba(214,183,145,.2)_55%,rgba(138,110,77,.3)_100%)]">
                            {article.imageURL ? (
                              <Image
                                src={article.imageURL}
                                alt={article.title}
                                fill
                                className="object-cover transition duration-500 ease-out group-hover:scale-110"
                                sizes="80px"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center">
                                <span className="h-4 w-4 rotate-45 border border-white/55" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-medium font-medium leading-snug text-[#e9f2e5]">
                              {article.title}
                            </p>
                            <p className="mt-1 text-xs text-[#adc0b3]">
                              {article.meta}
                            </p>
                            <Badge
                              variant="secondary"
                              className="mt-2 inline-flex rounded-md bg-white/12 px-2 py-0.5 text-[11px] font-medium text-[#dbe5d8]"
                            >
                              {article.category}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                : null}

              {!isPending && !error && latestArticles.length === 0 ? (
                <Card className="rounded-xl border border-white/6 bg-white/7 p-4 text-sm text-[#dbe5d8]">
                  Artikel ensiklopedia belum tersedia.
                </Card>
              ) : null}
            </div>

            <Button
              asChild
              className="group mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#d4e1d2] transition hover:text-white"
            >
              <Link href="/encyclopedia">
                Lihat semua artikel
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
