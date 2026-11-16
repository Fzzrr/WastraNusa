import { EncyclopediaDetailMain } from '@/components/encyclopedia/encyclopedia-detail-main';
import { articleKeys } from '@/hooks/use-article';
import { getSessionUser } from '@/lib/auth/auth';
import { isAdmin } from '@/lib/auth/roles';
import { toJson } from '@/lib/utils';
import { articleRepository } from '@/repositories/article.repository';
import { articleService } from '@/services/article.service';
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

  // A bad slug is a real 404, not a client-side "not found" state.
  const [article, user] = await Promise.all([
    getArticle(slug),
    getSessionUser(),
  ]);
  const canViewUnpublished = isAdmin(user?.role);
  if (!article || (article.status !== 'published' && !canViewUnpublished)) {
    notFound();
  }

  // Hand the article (incl. this user's like) to React Query so the page
  // renders with it instead of fetching it again from the browser. Views are
  // counted by the page itself (useRecordArticleView), not here. A failed
  // prefetch just falls back to the client fetch.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: articleKeys.detail(slug),
    queryFn: async () =>
      toJson(
        await articleService.getArticleDetail(
          slug,
          user?.id,
          canViewUnpublished,
        ),
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EncyclopediaDetailMain slug={slug} />
    </HydrationBoundary>
  );
}
