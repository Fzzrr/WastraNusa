import { createAddressSchema } from '@/schemas/address.schema';
import { describe, expect, it } from 'vitest';

const base = {
  label: 'Rumah',
  recipientName: 'Budi',
  phone: '0812-3456-7890',
  province: 'Jawa Tengah',
  city: 'Solo',
  district: 'Laweyan',
  postalCode: '57147',
  fullAddress: 'Jl. Mawar 1',
};

describe('createAddressSchema', { tags: ['backend'] }, () => {
  it('normalizes a phone number written with dashes or spaces', () => {
    expect(createAddressSchema.parse(base).phone).toBe('081234567890');
  });

  it.each([{ phone: 'abc' }, { postalCode: 'abcde' }, { postalCode: '1234' }])(
    'rejects %o',
    (override) => {
      expect(
        createAddressSchema.safeParse({ ...base, ...override }).success,
      ).toBe(false);
    },
  );
});
