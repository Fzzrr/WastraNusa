import { EncyclopediaDetailMain } from '@/components/encyclopedia/encyclopedia-detail-main';
import { articleRepository } from '@/repositories/article.repository';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EncyclopediaDetailPage({ params }: Props) {
  const { slug } = await params;

  // Detail is fetched client-side; check existence here so a bad slug is a real 404.
  if (!(await articleRepository.findByIdOrSlug(slug))) {
    notFound();
  }

  return <EncyclopediaDetailMain slug={slug} />;
}
