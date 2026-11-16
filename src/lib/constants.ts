/**
 * Application-wide business constants.
 */

/**
 * Admin marketplace commission taken on each seller sale (15%).
 *
 * Computed on the fly from this single source of truth (no commission columns
 * in the database), on item sales only: admin commission is
 * `itemSales * COMMISSION_RATE`, and the seller keeps
 * `itemSales - commission + shippingCost`. The buyer's service fee is the
 * platform's own and never reaches the seller.
 */
export const COMMISSION_RATE = 0.15;
