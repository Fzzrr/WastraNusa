import { CatalogDetailMain } from '@/components/catalog/detail/catalog-detail-main';
import { isForSale } from '@/lib/product-availability';
import { productRepository } from '@/repositories/product.repository';
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

  // Detail is fetched client-side; check existence here so a bad slug is a real 404.
  if (!(await getProduct(slug))) {
    notFound();
  }

  return <CatalogDetailMain slug={slug} />;
}
