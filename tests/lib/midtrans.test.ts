import { createParameter, verifySignatureKey } from '@/lib/midtrans';
import { createHash } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// tests/setup.ts mocks @/lib/midtrans globally; we need the real
// implementation here to exercise the actual SHA-512 signature logic.
vi.unmock('@/lib/midtrans');

describe('verifySignatureKey', { tags: ['backend'] }, () => {
  const orderId = 'order-123';
  const statusCode = '200';
  const grossAmount = '255000.00';
  const serverKey = 'test-server-key';
  const originalServerKey = process.env.MIDTRANS_SERVER_KEY;

  // Independently recompute the expected signature with Node's crypto so the
  // assertion is a genuine cross-check, not a tautology against the same code.
  const computeSignature = (
    oid: string,
    sc: string,
    amount: string,
    key: string,
  ) =>
    createHash('sha512')
      .update(oid + sc + amount + key)
      .digest('hex');

  beforeAll(() => {
    process.env.MIDTRANS_SERVER_KEY = serverKey;
  });

  afterAll(() => {
    process.env.MIDTRANS_SERVER_KEY = originalServerKey;
  });

  it('returns true for a correctly computed signature', async () => {
    const signature = computeSignature(
      orderId,
      statusCode,
      grossAmount,
      serverKey,
    );

    await expect(
      verifySignatureKey(orderId, statusCode, grossAmount, signature),
    ).resolves.toBe(true);
  });

  it('returns false for an arbitrary/forged signature', async () => {
    await expect(
      verifySignatureKey(orderId, statusCode, grossAmount, 'not-a-real-sig'),
    ).resolves.toBe(false);
  });

  it('returns false when the gross amount is tampered with', async () => {
    // Signature signed for the real amount, but a different amount is presented.
    const signature = computeSignature(
      orderId,
      statusCode,
      grossAmount,
      serverKey,
    );

    await expect(
      verifySignatureKey(orderId, statusCode, '1.00', signature),
    ).resolves.toBe(false);
  });

  it('returns false when signed with a different server key', async () => {
    // Simulates an attacker who does not know the real server key.
    const signature = computeSignature(
      orderId,
      statusCode,
      grossAmount,
      'attacker-guessed-key',
    );

    await expect(
      verifySignatureKey(orderId, statusCode, grossAmount, signature),
    ).resolves.toBe(false);
  });
});

describe('createParameter', { tags: ['backend'] }, () => {
  const originalBaseUrl = process.env.BETTER_AUTH_URL;
  const startTime = new Date('2026-11-03T05:00:00.000Z');
  const expiredAt = new Date('2026-11-03T05:30:00.000Z');

  afterAll(() => {
    process.env.BETTER_AUTH_URL = originalBaseUrl;
  });

  it('redirects to the order detail page after payment', () => {
    process.env.BETTER_AUTH_URL = 'https://wastranusa.test/';

    const parameter = createParameter(
      'order-123',
      263000,
      startTime,
      expiredAt,
    );

    expect(parameter.transaction_details).toEqual({
      order_id: 'order-123',
      gross_amount: 263000,
    });
    expect(parameter.callbacks).toEqual({
      finish: 'https://wastranusa.test/profile/my-order/order-123',
    });
  });

  it('sends an expiry matching the app payment deadline', () => {
    const parameter = createParameter(
      'order-123',
      263000,
      startTime,
      expiredAt,
    );

    expect(parameter.expiry).toEqual({
      start_time: '2026-11-03 12:00:00 +0700',
      unit: 'minute',
      duration: 30,
    });
  });

  it('omits callbacks when BETTER_AUTH_URL is not set', () => {
    delete process.env.BETTER_AUTH_URL;

    const parameter = createParameter(
      'order-123',
      263000,
      startTime,
      expiredAt,
    );

    expect(parameter.callbacks).toBeUndefined();
  });
});
