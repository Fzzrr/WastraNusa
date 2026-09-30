import { POST } from '@/app/api/chat/route';
import { ApiError } from '@/lib/error';
import { chatRateLimiter } from '@/lib/gemini/rate-limiter';
import { chatService } from '@/services/chat.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createJsonRequest(
  body: unknown,
  headers: Record<string, string> = {},
): Request {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/chat', { tags: ['backend'] }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chatRateLimiter.reset();
  });

  it('should return 200 with chatbot answer on valid request', async () => {
    vi.spyOn(chatService, 'answerQuestion').mockResolvedValue({
      reply: 'Motif kain tapis menggunakan benang emas.',
      articleId: 'art-1',
      cached: false,
    });

    const req = createJsonRequest({
      articleId: 'art-1',
      message: 'Benang apa yang digunakan?',
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
    expect(json.data.reply).toBe('Motif kain tapis menggunakan benang emas.');
    expect(json.data.articleId).toBe('art-1');
  });

  it('should return 400 when input is missing articleId or message', async () => {
    const req = createJsonRequest({
      articleId: '',
      message: '',
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.status).toBe('fail');
  });

  it('should return 400 when message exceeds 1000 characters', async () => {
    const req = createJsonRequest({
      articleId: 'art-1',
      message: 'x'.repeat(1001),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.status).toBe('fail');
  });

  it('should return 404 when article is not found', async () => {
    vi.spyOn(chatService, 'answerQuestion').mockRejectedValue(
      new ApiError('Artikel tidak ditemukan', 404),
    );

    const req = createJsonRequest({
      articleId: 'unknown-art',
      message: 'Pertanyaan',
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.status).toBe('fail');
    expect(json.data.message).toBe('Artikel tidak ditemukan');
  });

  it('should return 429 when client exceeds rate limit', async () => {
    vi.spyOn(chatService, 'answerQuestion').mockResolvedValue({
      reply: 'Jawaban',
      articleId: 'art-1',
    });

    const headers = { 'x-forwarded-for': '192.168.1.50' };

    // Chat rate limit is 10 requests per minute
    for (let i = 0; i < 10; i++) {
      const okReq = createJsonRequest(
        { articleId: 'art-1', message: `Pertanyaan ke-${i}` },
        headers,
      );
      const okRes = await POST(okReq, { params: Promise.resolve({}) });
      expect(okRes.status).toBe(200);
    }

    // 11th request should be rate-limited
    const blockedReq = createJsonRequest(
      { articleId: 'art-1', message: 'Pertanyaan melebihi limit' },
      headers,
    );
    const blockedRes = await POST(blockedReq, { params: Promise.resolve({}) });
    const blockedJson = await blockedRes.json();

    expect(blockedRes.status).toBe(429);
    expect(blockedJson.status).toBe('fail');
    expect(blockedJson.data.message).toContain('Terlalu banyak permintaan');
    expect(blockedJson.data.retryAfterSeconds).toBeDefined();
  });
});
