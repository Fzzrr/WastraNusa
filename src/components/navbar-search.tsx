'use client';

import { Input } from '@/components/ui/input';
import { useArticles } from '@/hooks/use-article';
import { useProductCatalog } from '@/hooks/use-product-catalog';
import {
  ARTICLE_SEARCH_LIMIT,
  PRODUCT_SEARCH_LIMIT,
  normalizeQuery,
  searchArticles,
  searchProducts,
} from '@/lib/search-filters';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BookOpenText,
  Search,
  SearchX,
  ShoppingBag,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

const MAX_SUGGESTIONS_PER_GROUP = 5;

/** Wraps case-insensitive matches of `query` in a highlight. */
function Highlight({
  text,
  query,
}: {
  text: string;
  query: string;
}): ReactNode {
  const needle = query.trim();
  if (!needle) return text;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === needle.toLowerCase() ? (
      <mark
        key={index}
        className="rounded-sm bg-[#f5ead3] px-0.5 text-[#8a6a2a]"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

type NavbarSearchProps = {
  className?: string;
  placeholder?: string;
  /** Called after navigating away, e.g. to close a mobile menu. */
  onSubmitted?: () => void;
};

export function NavbarSearch({
  className,
  placeholder = 'Cari produk atau artikel ensiklopedia...',
  onSubmitted,
}: NavbarSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: productData } = useProductCatalog(1, PRODUCT_SEARCH_LIMIT);
  const { data: articleData } = useArticles(1, ARTICLE_SEARCH_LIMIT);

  const normalizedQuery = normalizeQuery(query);

  const products = useMemo(
    () =>
      searchProducts(productData?.items ?? [], query).slice(
        0,
        MAX_SUGGESTIONS_PER_GROUP,
      ),
    [productData?.items, query],
  );

  const articles = useMemo(
    () =>
      searchArticles(articleData?.items ?? [], query).slice(
        0,
        MAX_SUGGESTIONS_PER_GROUP,
      ),
    [articleData?.items, query],
  );

  const hasResults = products.length > 0 || articles.length > 0;
  const showDropdown = isOpen && normalizedQuery.length > 0;

  // Close dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // "/" focuses the search from anywhere (unless already typing somewhere).
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, []);

  const goToSearchPage = () => {
    if (!normalizedQuery) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setIsOpen(false);
    onSubmitted?.();
  };

  const navigateTo = (href: string) => {
    router.push(href);
    setIsOpen(false);
    onSubmitted?.();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goToSearchPage();
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form
        onSubmit={handleSubmit}
        role="search"
        className="group/search flex w-full items-center gap-1 rounded-full bg-gradient-to-b from-white to-[#faf6ee] p-1 pl-1.5 shadow-[inset_0_1px_2px_rgba(60,41,15,0.06),0_1px_2px_rgba(60,41,15,0.04)] ring-1 ring-[#e0d6c5] transition-all duration-300 hover:ring-[#cdbfa6] focus-within:bg-white focus-within:shadow-[0_10px_28px_-14px_rgba(47,91,73,0.45)] focus-within:ring-2 focus-within:ring-[#2f5b49]/35"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f4efe5] text-[#8a6a3a] transition-all duration-300 group-focus-within/search:rotate-[-8deg] group-focus-within/search:bg-[#2f5b49] group-focus-within/search:text-[#e8cb8d]">
          <Search className="size-4" />
        </span>
        <Input
          ref={inputRef}
          className="h-9 w-full border-0 bg-transparent px-2 text-sm text-[#2f4f3f] shadow-none placeholder:text-[#a9a192] focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden"
          placeholder={placeholder}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsOpen(false);
              event.currentTarget.blur();
            }
          }}
          aria-label="Cari produk atau artikel"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Hapus pencarian"
            className="grid size-7 shrink-0 animate-in cursor-pointer place-items-center rounded-full text-[#9f9a8d] transition fade-in zoom-in-75 hover:bg-[#efe8dd] hover:text-[#2f4f3f]"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <kbd
            aria-hidden
            title="Tekan / untuk mencari"
            className="hidden h-6 shrink-0 items-center rounded-md border border-[#e0d6c5] bg-[#faf6ee] px-2 font-mono text-[11px] text-[#9a8f80] transition-opacity group-focus-within/search:opacity-0 lg:inline-flex"
          >
            /
          </kbd>
        )}
        <button
          type="submit"
          className="group/btn inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-[#2f5f49] to-[#3f7359] pr-3 pl-4 text-xs font-semibold text-[#eef3ea] shadow-[0_6px_14px_-8px_rgba(47,95,73,0.8)] transition-all hover:from-[#274e3c] hover:to-[#35644d] hover:shadow-[0_8px_18px_-8px_rgba(47,95,73,0.9)] active:scale-95"
        >
          Cari
          <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </form>

      {showDropdown ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-[28rem] origin-top animate-in overflow-y-auto rounded-2xl bg-[#fffdf8] p-1.5 text-left shadow-[0_24px_48px_-24px_rgba(47,91,73,0.45)] ring-1 ring-[#e3d9c7] duration-150 fade-in slide-in-from-top-1">
          {hasResults ? (
            <>
              {products.length > 0 ? (
                <div>
                  <p className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5 text-[11px] font-semibold tracking-wider text-[#7d8a7f] uppercase">
                    <ShoppingBag className="size-3.5" />
                    Produk
                    <span className="rounded-full bg-[#e3ece5] px-1.5 text-[10px] text-[#2f5b49]">
                      {products.length}
                    </span>
                  </p>
                  {products.map((product) => (
                    <button
                      key={`product-${product.slug}`}
                      type="button"
                      onClick={() => navigateTo(`/catalog/${product.slug}`)}
                      className="group/item flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-[#f4efe5]"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#ece1d0] ring-1 ring-[#e5dccf]">
                        {product.imageURL ? (
                          <Image
                            src={product.imageURL}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover/item:scale-110"
                            sizes="40px"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[#b59f80]">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-[#2f5b49] transition-colors group-hover/item:text-[#1f4636]">
                          <Highlight text={product.name} query={query} />
                        </p>
                        <p className="line-clamp-1 text-xs text-[#a8b5ab]">
                          {product.clothingType}, {product.province}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 -translate-x-1 text-[#caa86a] opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                    </button>
                  ))}
                </div>
              ) : null}

              {articles.length > 0 ? (
                <div className="mt-1 border-t border-[#f0ebe2] pt-1">
                  <p className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5 text-[11px] font-semibold tracking-wider text-[#7d8a7f] uppercase">
                    <BookOpenText className="size-3.5" />
                    Ensiklopedia
                    <span className="rounded-full bg-[#f5ead3] px-1.5 text-[10px] text-[#8a6a2a]">
                      {articles.length}
                    </span>
                  </p>
                  {articles.map((article) => (
                    <button
                      key={`article-${article.slug}`}
                      type="button"
                      onClick={() =>
                        navigateTo(`/encyclopedia/${article.slug}`)
                      }
                      className="group/item flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-[#f4efe5]"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#ece1d0] ring-1 ring-[#e5dccf]">
                        {article.imageURL ? (
                          <Image
                            src={article.imageURL}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover/item:scale-110"
                            sizes="40px"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[#b59f80]">
                            <BookOpenText className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-[#2f5b49] transition-colors group-hover/item:text-[#1f4636]">
                          <Highlight text={article.title} query={query} />
                        </p>
                        <p className="line-clamp-1 text-xs text-[#a8b5ab]">
                          {article.region}, {article.topic}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 -translate-x-1 text-[#caa86a] opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                    </button>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={goToSearchPage}
                className="group/all mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#f4efe5] px-4 py-2.5 text-center text-xs font-semibold text-[#2f5f49] transition hover:bg-[#2f5f49] hover:text-[#eef3ea]"
              >
                Lihat semua hasil untuk &ldquo;{query.trim()}&rdquo;
                <ArrowRight className="size-3.5 transition-transform group-hover/all:translate-x-0.5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 py-7 text-center">
              <span className="grid size-10 place-items-center rounded-full bg-[#f4efe5] text-[#b08a5e]">
                <SearchX className="size-5" />
              </span>
              <p className="text-sm font-medium text-[#4d6356]">
                Tidak ada hasil untuk &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="text-xs text-[#9a8f80]">
                Coba kata kunci lain, misalnya nama motif atau daerah.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
