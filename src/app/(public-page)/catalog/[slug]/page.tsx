import { CatalogDetailMain } from '@/components/catalog/detail/catalog-detail-main';
import { productRepository } from '@/repositories/product.repository';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CatalogDetailPage({ params }: Props) {
  const { slug } = await params;

  // Detail is fetched client-side; check existence here so a bad slug is a real 404.
  if (!(await productRepository.findByIdOrSlug(slug))) {
    notFound();
  }

  return <CatalogDetailMain slug={slug} />;
}
