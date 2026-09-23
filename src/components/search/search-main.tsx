'use client';

import { CatalogProductCard } from '@/components/catalog/main/catalog-product-card';
import { EncyclopediaArticleCard } from '@/components/encyclopedia';
import { Badge } from '@/components/ui/badge';
import { useArticles } from '@/hooks/use-article';
import { useProductCatalog } from '@/hooks/use-product-catalog';
import {
  ARTICLE_SEARCH_LIMIT,
  PRODUCT_SEARCH_LIMIT,
  normalizeQuery,
  searchArticles,
  searchProducts,
} from '@/lib/search-filters';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type SearchMainProps = {
  query: string;
};

export function SearchMain({ query }: SearchMainProps) {
  const router = useRouter();
  const normalizedQuery = normalizeQuery(query);

  const { data: productData, isPending: productsPending } = useProductCatalog(
    1,
    PRODUCT_SEARCH_LIMIT,
  );
  const { data: articleData, isPending: articlesPending } = useArticles(
    1,
    ARTICLE_SEARCH_LIMIT,
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

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-8 md:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-[#2f5b49]">
        <Search className="h-5 w-5" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Hasil Pencarian
        </h1>
      </div>

      {normalizedQuery ? (
        <div className="mt-3 inline-flex items-center gap-2.5 rounded-xl border border-[#e2dac9] bg-[#efeadf] py-1.5 pr-4 pl-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2f5f49] text-[#edf3eb]">
            <Search className="size-4" />
          </span>
          <p className="text-sm text-[#5b6f63]">
            {isPending ? (
              'Mencari…'
            ) : (
              <>
                Menampilkan{' '}
                <span className="rounded-md bg-[#2f5f49]/10 px-1.5 py-0.5 font-bold text-[#2f5b49]">
                  {totalResults}
                </span>{' '}
                hasil untuk{' '}
                <span className="font-semibold text-[#2f5b49]">
                  &ldquo;{query.trim()}&rdquo;
                </span>
              </>
            )}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-[#5f7366]">
          Masukkan kata kunci untuk mencari produk dan artikel ensiklopedia.
        </p>
      )}

      {/* Produk */}
      <section className="mt-8">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#2b4d3c]">Produk</h2>
          <Badge
            variant="outline"
            className="rounded-md border-[#dcd3c2] bg-[#f3ecdd] px-2 py-0.5 text-xs font-semibold text-[#9f8d72]"
          >
            {products.length}
          </Badge>
        </div>

        {isPending ? (
          <p className="mt-4 text-sm text-[#5f7366]">Memuat produk…</p>
        ) : products.length > 0 ? (
          <div className="mt-4 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <CatalogProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-[#d8cfbf] bg-[#fbf8f2] p-6 text-sm text-[#4f6658]">
            Tidak ada produk yang cocok dengan pencarian Anda.
          </div>
        )}
      </section>

      {/* Ensiklopedia */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#2b4d3c]">Ensiklopedia</h2>
          <Badge
            variant="outline"
            className="rounded-md border-[#dcd3c2] bg-[#f3ecdd] px-2 py-0.5 text-xs font-semibold text-[#9f8d72]"
          >
            {articles.length}
          </Badge>
        </div>

        {isPending ? (
          <p className="mt-4 text-sm text-[#5f7366]">Memuat artikel…</p>
        ) : articles.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <EncyclopediaArticleCard
                key={article.slug}
                article={article}
                onClick={() => router.push(`/encyclopedia/${article.slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-[#d8cfbf] bg-[#fbf8f2] p-6 text-sm text-[#4f6658]">
            Tidak ada artikel ensiklopedia yang cocok dengan pencarian Anda.
          </div>
        )}
      </section>
    </main>
  );
}
