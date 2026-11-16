import CatalogPage from '@/app/(public-page)/catalog/page';
import { CatalogMain } from '@/components/catalog/main/catalog-main';
import { useProductCatalog } from '@/hooks/use-product-catalog';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/use-product-catalog', () => ({
  useProductCatalog: vi.fn(() => ({
    data: undefined,
    error: null,
    isPending: true,
  })),
}));
vi.mock('@/components/catalog/main/catalog-filters-sidebar', () => ({
  CatalogFiltersSidebar: () => null,
}));
vi.mock('@/components/catalog/main/catalog-main-header', () => ({
  CatalogMainHeader: () => null,
}));

describe('catalog ?type= filter', { tags: ['frontend'] }, () => {
  it('passes ?type= from the URL to CatalogMain', async () => {
    const element = await CatalogPage({
      searchParams: Promise.resolve({ type: 'Batik' }),
    });

    expect(element.props.initialCategory).toBe('Batik');
  });

  it('ignores a repeated ?type= param', async () => {
    const element = await CatalogPage({
      searchParams: Promise.resolve({ type: ['Batik', 'Kebaya'] }),
    });

    expect(element.props.initialCategory).toBeUndefined();
  });

  it('queries the catalog with the initial clothing type', () => {
    render(<CatalogMain initialCategory="Kain Tenun" />);

    expect(useProductCatalog).toHaveBeenCalledWith(
      1,
      expect.any(Number),
      expect.objectContaining({ clothingType: 'Kain Tenun' }),
    );
  });
});
