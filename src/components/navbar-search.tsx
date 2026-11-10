'use client';

import { Input } from '@/components/ui/input';
import { useArticles } from '@/hooks/use-article';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useProductCatalog } from '@/hooks/use-product-catalog';
import {
  SEARCH_RESULT_LIMIT,
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
      <mark key={index} className="bg-transparent font-semibold text-brand">
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

  const normalizedQuery = normalizeQuery(query);
  // Only hit the API once typing pauses, and never on pages where the user
  // doesn't search at all (this component lives in the header of every page).
  const serverQuery = useDebouncedValue(query.trim());
  const shouldSearch = serverQuery.length > 0;

  const { data: productData, isFetching: productsFetching } = useProductCatalog(
    1,
    SEARCH_RESULT_LIMIT,
    { q: serverQuery },
    { enabled: shouldSearch },
  );
  const { data: articleData, isFetching: articlesFetching } = useArticles(
    1,
    SEARCH_RESULT_LIMIT,
    { q: serverQuery },
    { enabled: shouldSearch },
  );
  const isSearching =
    serverQuery !== query.trim() || productsFetching || articlesFetching;

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
        className="group/search flex w-full items-center gap-1 rounded-full bg-surface p-1 transition-colors focus-within:bg-card focus-within:outline-2 focus-within:outline-brand/40"
      >
        <button
          type="submit"
          aria-label="Cari"
          title="Cari"
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-ink-soft transition-colors hover:bg-brand hover:text-on-field active:scale-95 group-focus-within/search:text-brand"
        >
          <Search className="size-[18px]" strokeWidth={1.75} />
        </button>
        <Input
          ref={inputRef}
          className="h-9 w-full border-0 bg-transparent px-1 text-[15px] text-ink shadow-none placeholder:text-ink-soft/80 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden"
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
            className="grid size-9 shrink-0 animate-in cursor-pointer place-items-center rounded-full text-ink-soft transition fade-in zoom-in-75 hover:bg-surface hover:text-ink"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </form>

      {showDropdown ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-[28rem] origin-top animate-in overflow-y-auto rounded-xl bg-card p-1.5 text-left shadow-[0_24px_48px_-20px_rgba(31,53,43,0.35)] duration-150 fade-in slide-in-from-top-1">
          {hasResults ? (
            <>
              {products.length > 0 ? (
                <div>
                  <p className="flex items-center gap-2 px-3 pt-2.5 pb-1.5 text-[13px] text-ink-soft">
                    <ShoppingBag className="size-4" strokeWidth={1.75} />
                    Produk
                  </p>
                  {products.map((product) => (
                    <button
                      key={`product-${product.slug}`}
                      type="button"
                      onClick={() => navigateTo(`/catalog/${product.slug}`)}
                      className="group/item flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-surface"
                    >
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-surface">
                        {product.imageURL ? (
                          <Image
                            src={product.imageURL}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover/item:scale-110"
                            sizes="40px"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-ink-soft">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[15px] font-medium text-ink">
                          <Highlight text={product.name} query={query} />
                        </p>
                        <p className="line-clamp-1 text-[13px] text-ink-soft">
                          {product.province}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 -translate-x-1 text-brand opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                    </button>
                  ))}
                </div>
              ) : null}

              {articles.length > 0 ? (
                <div className="mt-1 pt-1">
                  <p className="flex items-center gap-2 px-3 pt-2.5 pb-1.5 text-[13px] text-ink-soft">
                    <BookOpenText className="size-4" strokeWidth={1.75} />
                    Ensiklopedia
                  </p>
                  {articles.map((article) => (
                    <button
                      key={`article-${article.slug}`}
                      type="button"
                      onClick={() =>
                        navigateTo(`/encyclopedia/${article.slug}`)
                      }
                      className="group/item flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-surface"
                    >
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-surface">
                        {article.imageURL ? (
                          <Image
                            src={article.imageURL}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover/item:scale-110"
                            sizes="40px"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-ink-soft">
                            <BookOpenText className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[15px] font-medium text-ink">
                          <Highlight text={article.title} query={query} />
                        </p>
                        <p className="line-clamp-1 text-[13px] text-ink-soft">
                          {article.region}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 -translate-x-1 text-brand opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                    </button>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={goToSearchPage}
                className="group/all mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-surface px-4 py-3 text-center text-[15px] font-semibold text-ink transition hover:bg-brand hover:text-on-field"
              >
                Semua hasil &ldquo;{query.trim()}&rdquo;
                <ArrowRight className="size-4 transition-transform group-hover/all:translate-x-0.5" />
              </button>
            </>
          ) : isSearching ? (
            <p className="px-4 py-7 text-center text-[15px] text-ink-soft">
              Mencari…
            </p>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 py-7 text-center">
              <SearchX className="size-6 text-ink-soft" strokeWidth={1.5} />
              <p className="text-[15px] text-ink-soft">
                Tidak ada hasil untuk &ldquo;{query.trim()}&rdquo;
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
