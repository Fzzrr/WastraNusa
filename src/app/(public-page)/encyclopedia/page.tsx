import { EncyclopediaMain } from '@/components/encyclopedia/encyclopedia-main';
import { ENCYCLOPEDIA_PAGE_SIZE, articleKeys } from '@/hooks/use-article';
import { toJson } from '@/lib/utils';
import { articleService } from '@/services/article.service';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import type { Metadata } from 'next';

type EncyclopediaPageProps = {
  searchParams: Promise<{
    island?: string;
    topic?: string;
    search?: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Ensiklopedia Budaya',
  description: 'Kenali sejarah, motif, dan makna wastra Nusantara.',
};

export default async function EncyclopediaPage({
  searchParams,
}: EncyclopediaPageProps) {
  const { island, topic, search } = await searchParams;

  // Prefetch the first page exactly as EncyclopediaMain asks for it (same key,
  // same arguments /api/articles passes for a public list). A failed prefetch
  // just falls back to the client fetch.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: articleKeys.list(1, ENCYCLOPEDIA_PAGE_SIZE, island, topic),
    queryFn: async () =>
      toJson(
        await articleService.getArticles(1, ENCYCLOPEDIA_PAGE_SIZE, {
          island: island || undefined,
          topic: topic || undefined,
        }),
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EncyclopediaMain
        key={`${island ?? 'all'}-${topic ?? 'all'}-${search ?? ''}`}
        initialIsland={island}
        initialTopic={topic}
        initialSearch={search}
      />
    </HydrationBoundary>
  );
}
