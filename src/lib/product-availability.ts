/**
 * Whether the public may see and buy a product: not deactivated, and owned by
 * a seller who can fulfil the order.
 */
export function isForSale(product: {
  status: string;
  sellerId: string | null;
}) {
  return product.status !== 'inactive' && product.sellerId !== null;
}
