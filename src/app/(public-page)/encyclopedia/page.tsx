import { EncyclopediaMain } from '@/components/encyclopedia/encyclopedia-main';
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

  return (
    <EncyclopediaMain
      key={`${island ?? 'all'}-${topic ?? 'all'}-${search ?? ''}`}
      initialIsland={island}
      initialTopic={topic}
      initialSearch={search}
    />
  );
}
