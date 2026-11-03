/* eslint-disable @next/next/no-img-element */
import { CartMain } from '@/components/cart/cart-main';
import { useCart } from '@/hooks/use-cart';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/hooks/use-cart', () => ({
  useCart: vi.fn(),
  useUpdateCartItem: () => ({ mutate: vi.fn() }),
  useRemoveMultipleFromCart: () => ({ mutate: vi.fn() }),
}));

const cartItem = (id: string, name: string, price: number, stock: number) => ({
  id,
  productId: `p-${id}`,
  variantId: null,
  quantity: 1,
  variant: null,
  product: {
    name,
    price,
    clothingType: 'Batik',
    province: 'Jawa Barat',
    imageURL: null,
    variants: [{ stock }],
  },
});

describe('CartMain', { tags: ['frontend'] }, () => {
  it('selects in-stock items by default so the total is ready', () => {
    vi.mocked(useCart).mockReturnValue({
      data: {
        items: [
          cartItem('a', 'Batik Kawung', 150000, 5),
          cartItem('b', 'Tenun Ikat', 200000, 0),
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    render(<CartMain />);

    const [, inStock, soldOut] = screen.getAllByRole(
      'checkbox',
    ) as HTMLInputElement[];
    expect(inStock.checked).toBe(true);
    expect(soldOut.checked).toBe(false);
    expect(soldOut.disabled).toBe(true);
    expect(screen.getByText('Stok habis')).toBeTruthy();
    expect(screen.getAllByText('Rp 150.000').length).toBeGreaterThan(1);

    fireEvent.click(inStock);
    expect(inStock.checked).toBe(false);
  });

  it('charges the variant price, not the product base price', () => {
    vi.mocked(useCart).mockReturnValue({
      data: {
        items: [
          {
            ...cartItem('a', 'Batik Parang', 485000, 5),
            variantId: 'v-1',
            variant: {
              id: 'v-1',
              name: 'Biru Indigo',
              type: 'color',
              price: 500000,
              stock: 12,
              imageURL: null,
            },
          },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    render(<CartMain />);

    expect(screen.getAllByText('Rp 500.000').length).toBeGreaterThan(1);
    expect(screen.queryByText('Rp 485.000')).toBeNull();
  });
});
