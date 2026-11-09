import { CatalogMain } from '@/components/catalog/main/catalog-main';
import type { Metadata } from 'next';

type Props = {
  searchParams: Promise<{ type?: string | string[] }>;
};

export const metadata: Metadata = {
  title: 'Katalog Produk',
  description:
    'Jelajahi kain dan busana tradisional Indonesia dari pengrajin lokal.',
};

export default async function CatalogPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const initialCategory = typeof type === 'string' ? type : undefined;

  // Remount on ?type= change so footer links work while already on /catalog.
  return (
    <CatalogMain key={initialCategory} initialCategory={initialCategory} />
  );
}
