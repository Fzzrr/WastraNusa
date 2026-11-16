import { EncyclopediaDetailMain } from '@/components/encyclopedia/encyclopedia-detail-main';
import { getSessionUser } from '@/lib/auth/auth';
import { isAdmin } from '@/lib/auth/roles';
import { articleRepository } from '@/repositories/article.repository';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Props = {
  params: Promise<{ slug: string }>;
};

// Shared by generateMetadata and the page, so the article is read once.
const getArticle = cache((slug: string) =>
  articleRepository.findByIdOrSlug(slug),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  // Drafts stay out of titles and link previews.
  if (article?.status !== 'published') return {};

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.imageURL ? [article.imageURL] : undefined,
    },
  };
}

export default async function EncyclopediaDetailPage({ params }: Props) {
  const { slug } = await params;

  // Detail is fetched client-side; check existence here so a bad slug is a real 404.
  const article = await getArticle(slug);
  const canView =
    article?.status === 'published' ||
    (article && isAdmin((await getSessionUser())?.role));

  if (!canView) {
    notFound();
  }

  return <EncyclopediaDetailMain slug={slug} />;
}
