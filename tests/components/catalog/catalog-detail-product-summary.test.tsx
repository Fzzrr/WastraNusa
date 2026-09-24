import { CatalogDetailProductSummary } from '@/components/catalog/detail/catalog-detail-product-summary';
import type { ProductInventoryItem } from '@/types/product';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function makeProduct(
  overrides: Partial<ProductInventoryItem> = {},
): ProductInventoryItem {
  return {
    id: 'prod-1',
    articleId: 'art-1',
    articleTitle: 'Batik',
    name: 'Batik Kawung',
    slug: 'batik-kawung',
    description: 'Deskripsi produk',
    price: 150000,
    stock: 10,
    sku: 'SKU-1',
    weight: 250,
    imageURL: null,
    island: 'Jawa',
    province: 'Jawa Tengah',
    clothingType: 'Batik',
    gender: 'male',
    status: 'active',
    sold: 0,
    variants: [],
    variantCount: 0,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  } as ProductInventoryItem;
}

const variantOptions = [
  { id: 's1', name: 'M', type: 'size', price: null, stock: 5, sku: 'M-1' },
  { id: 'c1', name: 'Merah', type: 'color', price: null, stock: 4, sku: 'R-1' },
] as unknown as ProductInventoryItem['variants'];

function baseProps(
  overrides: Partial<
    React.ComponentProps<typeof CatalogDetailProductSummary>
  > = {},
): React.ComponentProps<typeof CatalogDetailProductSummary> {
  return {
    product: makeProduct(),
    variantOptions,
    selectedVariant: undefined,
    selectedVariantPrice: 150000,
    selectedVariantStock: 5,
    safeQuantity: 1,
    onVariantChange: vi.fn(),
    onDecreaseQuantity: vi.fn(),
    onIncreaseQuantity: vi.fn(),
    onAddToCart: vi.fn(),
    onBuyNow: vi.fn(),
    isCartActionPending: false,
    ...overrides,
  };
}

const emptyNameButtons = () =>
  screen
    .getAllByRole('button')
    .filter((b) => (b.textContent ?? '').trim() === '');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CatalogDetailProductSummary', { tags: ['frontend'] }, () => {
  it('shows available stock and enables purchase when in stock', () => {
    const props = baseProps();
    render(<CatalogDetailProductSummary {...props} />);

    expect(screen.getByText('Stok tersedia: 5 unit')).toBeTruthy();

    const addBtn = screen.getByRole('button', {
      name: /tambah ke keranjang/i,
    }) as HTMLButtonElement;
    const buyBtn = screen.getByRole('button', {
      name: /beli langsung/i,
    }) as HTMLButtonElement;

    expect(addBtn.disabled).toBe(false);
    fireEvent.click(addBtn);
    fireEvent.click(buyBtn);

    expect(props.onAddToCart).toHaveBeenCalledTimes(1);
    expect(props.onBuyNow).toHaveBeenCalledTimes(1);
  });

  it('disables purchase when out of stock', () => {
    const props = baseProps({
      product: makeProduct({ stock: 0, status: 'out_of_stock' }),
      selectedVariantStock: 0,
    });
    render(<CatalogDetailProductSummary {...props} />);

    expect(screen.getByText('Stok tersedia: 0 unit')).toBeTruthy();

    const addBtn = screen.getByRole('button', {
      name: /tambah ke keranjang/i,
    }) as HTMLButtonElement;
    expect(addBtn.disabled).toBe(true);

    fireEvent.click(addBtn);
    expect(props.onAddToCart).not.toHaveBeenCalled();
  });

  it('fires onVariantChange when a variant button is clicked', () => {
    const props = baseProps();
    render(<CatalogDetailProductSummary {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /merah/i }));
    fireEvent.click(screen.getByRole('button', { name: 'M (5)' }));

    expect(props.onVariantChange).toHaveBeenCalledWith('Merah');
    expect(props.onVariantChange).toHaveBeenCalledWith('M');
  });

  it('disables the decrease button at the minimum quantity', () => {
    const props = baseProps({ safeQuantity: 1 });
    render(<CatalogDetailProductSummary {...props} />);

    const [decrease, increase] = emptyNameButtons();
    expect((decrease as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(increase);
    expect(props.onIncreaseQuantity).toHaveBeenCalledTimes(1);
  });

  it('allows decreasing when quantity is above the minimum', () => {
    const props = baseProps({ safeQuantity: 2 });
    render(<CatalogDetailProductSummary {...props} />);

    const [decrease] = emptyNameButtons();
    expect((decrease as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(decrease);
    expect(props.onDecreaseQuantity).toHaveBeenCalledTimes(1);
  });

  it('shows a pending state and disables actions while a cart action is in flight', () => {
    const props = baseProps({ isCartActionPending: true });
    render(<CatalogDetailProductSummary {...props} />);

    const pendingButtons = screen.getAllByRole('button', {
      name: /memproses/i,
    }) as HTMLButtonElement[];
    expect(pendingButtons.length).toBe(2);
    pendingButtons.forEach((b) => expect(b.disabled).toBe(true));
  });
});
