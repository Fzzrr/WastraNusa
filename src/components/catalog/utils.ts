import { formatIDR } from '@/lib/utils';

export function getVariantResolvedPrice(
  variant: { price: number | null } | null | undefined,
  fallbackPrice: number,
) {
  return variant?.price ?? fallbackPrice;
}

export function getVariantPriceRange(
  variants: Array<{ price: number | null }>,
  fallbackPrice: number,
) {
  if (variants.length === 0) {
    return { min: fallbackPrice, max: fallbackPrice };
  }

  const prices = variants.map((variant) =>
    getVariantResolvedPrice(variant, fallbackPrice),
  );

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export function formatVariantPriceRange(
  variants: Array<{ price: number | null }>,
  fallbackPrice: number,
) {
  const { min, max } = getVariantPriceRange(variants, fallbackPrice);

  if (min === max) {
    return formatIDR(min);
  }

  return `${formatIDR(min)} - ${formatIDR(max)}`;
}
