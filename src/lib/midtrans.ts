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
};

export function createParameter(
  order_id: string,
  gross_amount: number,
): SnapParameters {
  const baseUrl = process.env.BETTER_AUTH_URL?.replace(/\/+$/, '');

  return {
    transaction_details: {
      order_id,
      gross_amount,
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
): Promise<SnapTransactionResponse> {
  const parameter = createParameter(order_id, gross_amount);
  const transaction = await midtrans_snap.createTransaction(parameter);
  return transaction;
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
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? '';
  const payload = orderId + statusCode + grossAmount + serverKey;

  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const expectedSignature = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSignature === signatureKey;
}
