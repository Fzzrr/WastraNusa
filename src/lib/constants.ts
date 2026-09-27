/**
 * Application-wide business constants.
 */

/**
 * Admin marketplace commission taken on each seller sale (15%).
 *
 * Commission is computed on the fly from this single source of truth — there
 * are no commission columns in the database. Seller net revenue is
 * `gross * (1 - COMMISSION_RATE)`; admin commission is `gross * COMMISSION_RATE`.
 */
export const COMMISSION_RATE = 0.15;
