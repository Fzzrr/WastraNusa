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
import { ArrowRight, BookOpenText, Search, ShoppingBag, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

const MAX_SUGGESTIONS_PER_GROUP = 5;

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
        className="flex w-full items-center overflow-hidden rounded-xl border border-[#d8cfbf] bg-[#f3ede2] transition-all duration-300 focus-within:border-[#2f5b49]/40 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(47,91,73,0.08)]"
      >
        <Search className="ml-3.5 h-4 w-4 shrink-0 text-[#9f9a8d]" />
        <Input
          className="h-10 w-full border-0 bg-transparent px-3 text-sm text-[#445f50] placeholder:text-[#b2ad9f] focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden"
          placeholder={placeholder}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          aria-label="Cari produk atau artikel"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            aria-label="Hapus pencarian"
            className="mr-1 shrink-0 rounded-full p-1 text-[#9f9a8d] transition hover:bg-[#e8e1d2] hover:text-[#5f6a5f]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <button
          type="submit"
          className="m-1 shrink-0 rounded-lg bg-[#2f5f49] px-4 py-1.5 text-xs font-semibold text-[#eef3ea] transition hover:bg-[#274e3c] active:scale-95"
        >
          Cari
        </button>
      </form>

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[28rem] overflow-y-auto rounded-xl border border-[#ddd3c2] bg-[#fdfaf7] text-left shadow-[0_20px_45px_-24px_rgba(47,91,73,0.35)]">
          {hasResults ? (
            <>
              {products.length > 0 ? (
                <div>
                  <p className="flex items-center gap-1.5 px-4 pt-3 pb-1.5 text-xs font-semibold text-[#7d8a7f]">
                    <ShoppingBag className="size-3.5" />
                    Produk
                  </p>
                  {products.map((product) => (
                    <button
                      key={`product-${product.slug}`}
                      type="button"
                      onClick={() => navigateTo(`/catalog/${product.slug}`)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[#f3ede2]"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#e5dccf] bg-[#ece1d0]">
                        {product.imageURL ? (
                          <Image
                            src={product.imageURL}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[#b59f80]">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-[#2f5b49]">
                          {product.name}
                        </p>
                        <p className="line-clamp-1 text-xs text-[#a8b5ab]">
                          {product.clothingType}, {product.province}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              {articles.length > 0 ? (
                <div className="border-t border-[#f0ebe2]">
                  <p className="flex items-center gap-1.5 px-4 pt-3 pb-1.5 text-xs font-semibold text-[#7d8a7f]">
                    <BookOpenText className="size-3.5" />
                    Ensiklopedia
                  </p>
                  {articles.map((article) => (
                    <button
                      key={`article-${article.slug}`}
                      type="button"
                      onClick={() =>
                        navigateTo(`/encyclopedia/${article.slug}`)
                      }
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[#f3ede2]"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#e5dccf] bg-[#ece1d0]">
                        {article.imageURL ? (
                          <Image
                            src={article.imageURL}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[#b59f80]">
                            <BookOpenText className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-[#2f5b49]">
                          {article.title}
                        </p>
                        <p className="line-clamp-1 text-xs text-[#a8b5ab]">
                          {article.region}, {article.topic}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={goToSearchPage}
                className="flex w-full items-center justify-center gap-1.5 border-t border-[#f0ebe2] px-4 py-2.5 text-center text-xs font-semibold text-[#2f5f49] transition hover:bg-[#f3ede2]"
              >
                Lihat semua hasil untuk &ldquo;{query.trim()}&rdquo;
                <ArrowRight className="size-3.5" />
              </button>
            </>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-[#7a8d7f]">
              Tidak ada hasil untuk &ldquo;{query.trim()}&rdquo;
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
