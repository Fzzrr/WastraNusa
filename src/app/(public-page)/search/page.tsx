import { SearchMain } from '@/components/search/search-main';
import type { Metadata } from 'next';

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Pencarian',
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;

  return <SearchMain key={q ?? ''} query={q ?? ''} />;
}
