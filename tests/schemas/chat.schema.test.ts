import { chatRequestSchema } from '@/schemas/chat.schema';
import { describe, expect, it } from 'vitest';

describe('chatRequestSchema', () => {
  it('should validate valid chat request', () => {
    const input = {
      articleId: 'art-123',
      message: 'Apa bahan utama kain tapis ini?',
      history: [
        { role: 'user', text: 'Halo' },
        {
          role: 'model',
          text: 'Halo, ada yang bisa dibantu mengenai artikel ini?',
        },
      ],
    };

    const parsed = chatRequestSchema.parse(input);
    expect(parsed.articleId).toBe('art-123');
    expect(parsed.message).toBe('Apa bahan utama kain tapis ini?');
    expect(parsed.history?.length).toBe(2);
  });

  it('should allow request without history', () => {
    const input = {
      articleId: 'art-123',
      message: 'Bagaimana teknik pembuatannya?',
    };

    const parsed = chatRequestSchema.parse(input);
    expect(parsed.articleId).toBe('art-123');
    expect(parsed.history).toBeUndefined();
  });

  it('should reject empty articleId', () => {
    const input = {
      articleId: '   ',
      message: 'Pertanyaan',
    };

    expect(() => chatRequestSchema.parse(input)).toThrow(
      'articleId wajib diisi',
    );
  });

  it('should reject empty message', () => {
    const input = {
      articleId: 'art-123',
      message: '   ',
    };

    expect(() => chatRequestSchema.parse(input)).toThrow(
      'Pertanyaan tidak boleh kosong',
    );
  });

  it('should reject message exceeding 1000 characters', () => {
    const input = {
      articleId: 'art-123',
      message: 'a'.repeat(1001),
    };

    expect(() => chatRequestSchema.parse(input)).toThrow(
      'Pertanyaan maksimal 1000 karakter',
    );
  });

  it('should reject history with more than 10 messages', () => {
    const history = Array.from({ length: 11 }, (_, i) => ({
      role: i % 2 === 0 ? ('user' as const) : ('model' as const),
      text: `Pesan ${i}`,
    }));

    const input = {
      articleId: 'art-123',
      message: 'Pertanyaan',
      history,
    };

    expect(() => chatRequestSchema.parse(input)).toThrow(
      'Riwayat percakapan maksimal 10 pesan',
    );
  });

  it('should reject invalid role in history', () => {
    const input = {
      articleId: 'art-123',
      message: 'Pertanyaan',
      history: [{ role: 'system' as never, text: 'Halo' }],
    };

    expect(() => chatRequestSchema.parse(input)).toThrow();
  });
});
