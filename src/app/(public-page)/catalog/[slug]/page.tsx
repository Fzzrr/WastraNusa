import { CatalogDetailMain } from '@/components/catalog/detail/catalog-detail-main';
import { productCatalogKeys } from '@/hooks/use-product-catalog';
import { isForSale } from '@/lib/product-availability';
import { toJson } from '@/lib/utils';
import { productRepository } from '@/repositories/product.repository';
import { mapProduct } from '@/services/product.service';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Props = {
  params: Promise<{ slug: string }>;
};

// Shared by generateMetadata and the page, so the product is read once.
// Products that aren't for sale 404 like unknown slugs.
const getProduct = cache(async (slug: string) => {
  const product = await productRepository.findByIdOrSlug(slug);
  return product && isForSale(product) ? product : null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};

  const description =
    product.description?.slice(0, 160) ||
    `${product.clothingType} dari ${product.province}`;
  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.imageURL ? [product.imageURL] : undefined,
    },
  };
}

export default async function CatalogDetailPage({ params }: Props) {
  const { slug } = await params;

  // A bad slug is a real 404, not a client-side "not found" state.
  const product = await getProduct(slug);
  if (!product) {
    notFound();
  }

  // Hand the product to React Query so the page renders with it instead of
  // fetching it again from the browser. A failed prefetch just falls back to
  // the client fetch.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: productCatalogKeys.detail(slug),
    queryFn: () => toJson(mapProduct(product)),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CatalogDetailMain slug={slug} />
    </HydrationBoundary>
  );
}
