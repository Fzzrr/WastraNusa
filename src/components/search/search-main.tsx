'use client';

import { CatalogProductCard } from '@/components/catalog/main/catalog-product-card';
import { EncyclopediaArticleCard } from '@/components/encyclopedia';
import { useArticles } from '@/hooks/use-article';
import { useProductCatalog } from '@/hooks/use-product-catalog';
import {
  SEARCH_RESULT_LIMIT,
  normalizeQuery,
  searchArticles,
  searchProducts,
} from '@/lib/search-filters';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type SearchMainProps = {
  query: string;
};

export function SearchMain({ query }: SearchMainProps) {
  const router = useRouter();
  const normalizedQuery = normalizeQuery(query);

  const serverQuery = query.trim();
  const shouldSearch = serverQuery.length > 0;
  const { data: productData, isLoading: productsPending } = useProductCatalog(
    1,
    SEARCH_RESULT_LIMIT,
    { q: serverQuery },
    { enabled: shouldSearch },
  );
  const { data: articleData, isLoading: articlesPending } = useArticles(
    1,
    SEARCH_RESULT_LIMIT,
    { q: serverQuery },
    { enabled: shouldSearch },
  );

  const products = useMemo(
    () => searchProducts(productData?.items ?? [], query),
    [productData?.items, query],
  );

  const articles = useMemo(
    () => searchArticles(articleData?.items ?? [], query),
    [articleData?.items, query],
  );

  const isPending = productsPending || articlesPending;
  const totalResults = products.length + articles.length;

  const heading = (label: string, count: number) => (
    <h2 className="flex items-baseline gap-3 text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink">
      {label}
      {!isPending ? (
        <span className="text-base font-normal text-ink-soft tabular-nums">
          {count}
        </span>
      ) : null}
    </h2>
  );

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 md:px-6 lg:px-8">
      <h1 className="text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-ink">
        {normalizedQuery ? <>&ldquo;{query.trim()}&rdquo;</> : 'Cari'}
      </h1>
      <p className="mt-3 text-lg text-ink-soft">
        {!normalizedQuery
          ? 'Ketik nama kain, motif, atau daerah di kolom pencarian.'
          : isPending
            ? 'Mencari…'
            : `${totalResults} hasil`}
      </p>

      <section className="mt-10">
        {heading('Produk', products.length)}
        {isPending ? null : products.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <CatalogProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-base text-ink-soft">Tidak ada produk.</p>
        )}
      </section>

      <section className="mt-14">
        {heading('Ensiklopedia', articles.length)}
        {isPending ? null : articles.length > 0 ? (
          <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <EncyclopediaArticleCard
                key={article.slug}
                article={article}
                onClick={() => router.push(`/encyclopedia/${article.slug}`)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-base text-ink-soft">Tidak ada artikel.</p>
        )}
      </section>
    </main>
  );
}
