/* eslint-disable @next/next/no-img-element */
import { CartItem } from '@/components/cart/cart-item';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

const baseItem = {
  id: 'item-1',
  productId: 'product-1',
  name: 'Kemeja Batik Kawung',
  price: 150000,
  quantity: 2,
  size: 'M',
  stock: 8,
  clothingType: 'Batik',
  province: 'Jawa Tengah',
  imageURL: null as string | null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CartItem', { tags: ['frontend'] }, () => {
  it('renders the product name, formatted price, size and stock', () => {
    render(
      <CartItem
        item={baseItem}
        isSelected={false}
        onToggle={vi.fn()}
        onUpdateQty={vi.fn()}
      />,
    );

    expect(screen.getByText('Kemeja Batik Kawung')).toBeTruthy();
    expect(screen.getByText('Rp 150.000')).toBeTruthy();
    expect(screen.getByText('Size M')).toBeTruthy();
    expect(screen.getByText('Stok: 8')).toBeTruthy();
  });

  it('fires onToggle when the checkbox is clicked', () => {
    const onToggle = vi.fn();
    render(
      <CartItem
        item={baseItem}
        isSelected={false}
        onToggle={onToggle}
        onUpdateQty={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('fires onUpdateQty with +1 / -1 from the stepper buttons', () => {
    const onUpdateQty = vi.fn();
    render(
      <CartItem
        item={baseItem}
        isSelected
        onToggle={vi.fn()}
        onUpdateQty={onUpdateQty}
      />,
    );

    const buttons = screen.getAllByRole('button');
    // First stepper button is minus, second is plus.
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(onUpdateQty).toHaveBeenNthCalledWith(1, -1);
    expect(onUpdateQty).toHaveBeenNthCalledWith(2, 1);
  });

  it('renders the product image when an imageURL is provided', () => {
    render(
      <CartItem
        item={{ ...baseItem, imageURL: 'https://cdn.test/x.png' }}
        isSelected={false}
        onToggle={vi.fn()}
        onUpdateQty={vi.fn()}
      />,
    );

    const img = screen.getByAltText('Kemeja Batik Kawung') as HTMLImageElement;
    expect(img.src).toBe('https://cdn.test/x.png');
  });
});
