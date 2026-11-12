import { createHash, timingSafeEqual } from 'crypto';
import midtransClient from 'midtrans-client';
import type {
  SnapTransactionParameters,
  SnapTransactionResponse,
} from 'midtrans-client';

// payment flow : https://docs.midtrans.com/reference/getting-started-with-snap
const midtrans_snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY ?? '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY ?? '',
});

// @types/midtrans-client only declares transaction_details.
// @see https://docs.midtrans.com/reference/json-object
type SnapParameters = SnapTransactionParameters & {
  callbacks?: { finish: string };
  expiry?: { start_time: string; unit: 'minute'; duration: number };
};

// Midtrans expects "yyyy-MM-dd HH:mm:ss +0700".
function formatMidtransTime(date: Date) {
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return `${wib.toISOString().slice(0, 19).replace('T', ' ')} +0700`;
}

export function createParameter(
  order_id: string,
  gross_amount: number,
  startTime: Date,
  expiredAt: Date,
): SnapParameters {
  const baseUrl = process.env.BETTER_AUTH_URL?.replace(/\/+$/, '');

  return {
    transaction_details: {
      order_id,
      gross_amount,
    },
    // Keep Midtrans' payment window identical to the one the app enforces.
    expiry: {
      start_time: formatMidtransTime(startTime),
      unit: 'minute',
      duration: Math.round((expiredAt.getTime() - startTime.getTime()) / 60000),
    },
    ...(baseUrl && {
      callbacks: {
        finish: `${baseUrl}/profile/my-order/${encodeURIComponent(order_id)}`,
      },
    }),
  };
}

export async function createMidtransTransaction(
  order_id: string,
  gross_amount: number,
  startTime: Date,
  expiredAt: Date,
): Promise<SnapTransactionResponse> {
  const parameter = createParameter(
    order_id,
    gross_amount,
    startTime,
    expiredAt,
  );
  const transaction = await midtrans_snap.createTransaction(parameter);
  return transaction;
}

/**
 * Best-effort: closes a still-pending Midtrans transaction so a cancelled
 * order can no longer be paid. Midtrans answers 404 while the buyer has not
 * picked a payment method yet; that is expected and only logged by callers.
 */
export async function expireMidtransTransaction(orderId: string) {
  // @types/midtrans-client doesn't declare `transaction`.
  const { transaction } = midtrans_snap as unknown as {
    transaction: { expire(id: string): Promise<unknown> };
  };
  return transaction.expire(orderId);
}

/**
 * Asks Midtrans for a transaction's current status. The response has the same
 * fields as a notification (incl. signature_key). Returns null on 404, which
 * means the buyer never picked a payment method, so nothing can be paid.
 * @see https://docs.midtrans.com/reference/get-transaction-status
 */
export async function getMidtransTransactionStatus(
  orderId: string,
): Promise<Record<string, unknown> | null> {
  // @types/midtrans-client doesn't declare `transaction`.
  const { transaction } = midtrans_snap as unknown as {
    transaction: { status(id: string): Promise<Record<string, unknown>> };
  };
  try {
    return await transaction.status(orderId);
  } catch (error) {
    const httpStatus = (error as { httpStatusCode?: unknown }).httpStatusCode;
    if (Number(httpStatus) === 404) return null;
    throw error;
  }
}

/**
 * Verifies the Midtrans notification signature key.
 * Formula: SHA512(order_id + status_code + gross_amount + server_key)
 * @see https://docs.midtrans.com/reference/receiving-notifications
 */
export async function verifySignatureKey(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
): Promise<boolean> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  // Without a key anyone could compute a "valid" signature.
  if (!serverKey) return false;

  const expected = createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest();
  const received = Buffer.from(signatureKey, 'hex');

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}
