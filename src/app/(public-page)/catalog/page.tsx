import { CatalogMain } from '@/components/catalog/main/catalog-main';
import {
  CATALOG_PAGE_SIZE,
  DEFAULT_CATALOG_SORT,
  productCatalogKeys,
  productCatalogSearchParams,
} from '@/hooks/use-product-catalog';
import { toJson } from '@/lib/utils';
import { parseCatalogQuery, productService } from '@/services/product.service';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import type { Metadata } from 'next';

type Props = {
  searchParams: Promise<{ type?: string | string[] }>;
};

export const metadata: Metadata = {
  title: 'Katalog Produk',
  description:
    'Jelajahi kain dan busana tradisional Indonesia dari pengrajin lokal.',
};

export default async function CatalogPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const initialCategory = typeof type === 'string' ? type : undefined;

  // Prefetch the first page exactly as CatalogMain asks for it: same key,
  // and the same query string read the same way as /api/products. A failed
  // prefetch just falls back to the client fetch.
  const filters = {
    clothingType: initialCategory,
    sortBy: DEFAULT_CATALOG_SORT,
  };
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: productCatalogKeys.list(1, CATALOG_PAGE_SIZE, filters),
    queryFn: async () => {
      const query = parseCatalogQuery(
        productCatalogSearchParams(1, CATALOG_PAGE_SIZE, filters),
      );
      return toJson(
        await productService.getProducts(
          query.page,
          query.limit,
          query.filters,
        ),
      );
    },
  });

  // Remount on ?type= change so footer links work while already on /catalog.
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CatalogMain key={initialCategory} initialCategory={initialCategory} />
    </HydrationBoundary>
  );
}
