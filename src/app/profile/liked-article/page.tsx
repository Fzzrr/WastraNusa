import { LikedArticlesMain } from '@/components/profile/liked-article/liked-articles-main';
import { requireUser } from '@/lib/auth/auth-page-helper';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Artikel Disukai' };

export default async function LikedArticlesPage() {
  await requireUser();

  return <LikedArticlesMain />;
}
