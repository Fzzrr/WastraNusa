/* eslint-disable @next/next/no-img-element */
import { CartList, type CartProduct } from '@/components/cart/cart-list';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

const items: CartProduct[] = [
  {
    id: 'item-1',
    productId: 'prod-1',
    variantId: 'var-1',
    name: 'Batik Kawung',
    price: 150000,
    size: 'M',
    stock: 8,
    quantity: 1,
    clothingType: 'Batik',
    province: 'Jawa Tengah',
    imageURL: null,
  },
  {
    id: 'item-2',
    productId: 'prod-2',
    variantId: null,
    name: 'Tenun Ikat',
    price: 200000,
    size: 'L',
    stock: 3,
    quantity: 2,
    clothingType: 'Tenun',
    province: 'NTT',
    imageURL: null,
  },
];

function setup(overrides: Partial<React.ComponentProps<typeof CartList>> = {}) {
  const props = {
    items,
    selectedIds: [] as string[],
    onToggleItem: vi.fn(),
    onToggleAll: vi.fn(),
    onUpdateQty: vi.fn(),
    onDeleteSelected: vi.fn(),
    ...overrides,
  };
  render(<CartList {...props} />);
  return props;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CartList', { tags: ['frontend'] }, () => {
  it('renders the item count and every product', () => {
    setup();

    expect(screen.getByText('Pilih Semua (2)')).toBeTruthy();
    expect(screen.getByText('Batik Kawung')).toBeTruthy();
    expect(screen.getByText('Tenun Ikat')).toBeTruthy();
  });

  it('marks the select-all checkbox as checked when all items are selected', () => {
    setup({ selectedIds: ['item-1', 'item-2'] });

    const allCheckbox = screen.getByRole('checkbox', {
      name: /Pilih Semua/,
    }) as HTMLInputElement;
    expect(allCheckbox.checked).toBe(true);
  });

  it('hides the delete button when nothing is selected', () => {
    setup({ selectedIds: [] });

    expect(screen.queryByRole('button', { name: /hapus/i })).toBeNull();
  });

  it('shows the delete button and fires onDeleteSelected when items are selected', () => {
    const props = setup({ selectedIds: ['item-1'] });

    fireEvent.click(screen.getByRole('button', { name: /hapus/i }));

    expect(props.onDeleteSelected).toHaveBeenCalledTimes(1);
  });

  it('fires onToggleAll when the select-all checkbox is clicked', () => {
    const props = setup();

    fireEvent.click(screen.getByRole('checkbox', { name: /Pilih Semua/ }));

    expect(props.onToggleAll).toHaveBeenCalledTimes(1);
  });

  it('fires onToggleItem with the item id when an item checkbox is clicked', () => {
    const props = setup();

    // checkbox[0] is the select-all; the rest are per-item in order.
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    expect(props.onToggleItem).toHaveBeenCalledWith('item-1');
  });
});
