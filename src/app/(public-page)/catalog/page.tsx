import { CatalogMain } from '@/components/catalog/main/catalog-main';

type Props = {
  searchParams: Promise<{ type?: string | string[] }>;
};

export default async function CatalogPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const initialCategory = typeof type === 'string' ? type : undefined;

  // Remount on ?type= change so footer links work while already on /catalog.
  return (
    <CatalogMain key={initialCategory} initialCategory={initialCategory} />
  );
}
