import { EncyclopediaDetailMain } from '@/components/encyclopedia/encyclopedia-detail-main';
import { getSessionUser } from '@/lib/auth/auth';
import { isAdmin } from '@/lib/auth/roles';
import { articleRepository } from '@/repositories/article.repository';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EncyclopediaDetailPage({ params }: Props) {
  const { slug } = await params;

  // Detail is fetched client-side; check existence here so a bad slug is a real 404.
  const article = await articleRepository.findByIdOrSlug(slug);
  const canView =
    article?.status === 'published' ||
    (article && isAdmin((await getSessionUser())?.role));

  if (!canView) {
    notFound();
  }

  return <EncyclopediaDetailMain slug={slug} />;
}
