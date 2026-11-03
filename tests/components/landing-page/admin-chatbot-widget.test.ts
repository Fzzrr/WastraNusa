import { findFaqAnswer } from '@/components/landing-page/admin-chatbot-widget';
import { describe, expect, it } from 'vitest';

describe('findFaqAnswer', { tags: ['frontend'] }, () => {
  it('matches the FAQ with the most keyword hits', () => {
    expect(findFaqAnswer('Gimana cara lacak status pesanan?')).toContain(
      'Pesanan Saya',
    );
    expect(findFaqAnswer('Saya mau buka toko')).toContain('Buka Toko');
  });

  it('falls back when nothing matches', () => {
    expect(findFaqAnswer('cuaca hari ini')).toContain('Maaf');
  });
});
