import { articleContextCache, chatReplyCache } from '@/lib/gemini/cache';
import { llmService } from '@/lib/gemini/llm.service';
import { articleRepository } from '@/repositories/article.repository';
import { chatService } from '@/services/chat.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockArticleRepo = vi.mocked(articleRepository);

const MOCK_PUBLISHED_ARTICLE = {
  id: 'art-1',
  title: 'Kain Tapis Lampung',
  slug: 'kain-tapis-lampung',
  description: 'Deskripsi singkat',
  excerpt: 'Kain tradisional khas Lampung',
  province: 'Lampung',
  island: 'Sumatera',
  region: 'Lampung Selatan',
  topic: 'Kain Adat',
  ethnicGroup: 'Pepadun',
  clothingType: 'Kain Sarung',
  motifLabel: 'Pucuk Rebung',
  summary: 'Kain tenun dengan benang emas',
  status: 'published' as const,
  readMinutes: 5,
  featured: false,
  imageURL: null,
  createdBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  sections: [
    {
      id: 'sec-1',
      articleId: 'art-1',
      title: 'Sejarah',
      content: 'Tapis telah ada sejak abad ke-2 SM.',
      order: 1,
      imageLabel: null,
      imageCaption: null,
      imageURL: null,
    },
    {
      id: 'sec-2',
      articleId: 'art-1',
      title: 'Makna Simbolik',
      content: 'Motif pucuk rebung melambangkan kesuburan dan harapan hidup.',
      order: 2,
      imageLabel: null,
      imageCaption: null,
      imageURL: null,
    },
  ],
};

const MOCK_DRAFT_ARTICLE = {
  ...MOCK_PUBLISHED_ARTICLE,
  id: 'art-draft',
  status: 'draft' as const,
};

describe('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    articleContextCache.clear();
    chatReplyCache.clear();
  });

  describe('answerQuestion', () => {
    it('should throw 404 if article does not exist', async () => {
      mockArticleRepo.findByIdOrSlug.mockResolvedValue(null);

      await expect(
        chatService.answerQuestion({
          articleId: 'non-existent',
          message: 'Apa maknanya?',
        }),
      ).rejects.toThrow('Artikel tidak ditemukan');
    });

    it('should throw 403 if article is draft or not published', async () => {
      mockArticleRepo.findByIdOrSlug.mockResolvedValue(
        MOCK_DRAFT_ARTICLE as never,
      );

      await expect(
        chatService.answerQuestion({
          articleId: 'art-draft',
          message: 'Apa maknanya?',
        }),
      ).rejects.toThrow('Artikel ini bersifat privat/draft');
    });

    it('should answer question successfully using LLM and return result', async () => {
      mockArticleRepo.findByIdOrSlug.mockResolvedValue(
        MOCK_PUBLISHED_ARTICLE as never,
      );
      const chatSpy = vi.spyOn(llmService, 'chat').mockResolvedValue({
        reply: 'Motif pucuk rebung melambangkan kesuburan dan harapan hidup.',
        model: 'gemini-2.5-flash',
      });

      const res = await chatService.answerQuestion({
        articleId: 'art-1',
        message: 'Apa makna motif pucuk rebung?',
      });

      expect(res.articleId).toBe('art-1');
      expect(res.reply).toContain('kesuburan dan harapan hidup');
      expect(res.cached).toBe(false);

      expect(chatSpy).toHaveBeenCalledTimes(1);
      const callArgs = chatSpy.mock.calls[0][0];
      expect(callArgs.systemInstruction).toContain(
        'HANYA berdasarkan isi teks artikel',
      );
      expect(callArgs.articleContext).toContain('Kain Tapis Lampung');
      expect(callArgs.articleContext).toContain(
        'Tapis telah ada sejak abad ke-2 SM.',
      );
      expect(callArgs.message).toBe('Apa makna motif pucuk rebung?');
    });

    it('should return cached answer on identical question without invoking LLM again', async () => {
      mockArticleRepo.findByIdOrSlug.mockResolvedValue(
        MOCK_PUBLISHED_ARTICLE as never,
      );
      const chatSpy = vi.spyOn(llmService, 'chat').mockResolvedValue({
        reply: 'Jawaban dari model AI',
        model: 'gemini-2.5-flash',
      });

      // First query
      const firstRes = await chatService.answerQuestion({
        articleId: 'art-1',
        message: 'Bagaimana sejarah tapis?',
      });
      expect(firstRes.cached).toBe(false);
      expect(chatSpy).toHaveBeenCalledTimes(1);

      // Second identical query (case-insensitive)
      const secondRes = await chatService.answerQuestion({
        articleId: 'art-1',
        message: '  bagaimana sejarah tapis?  ',
      });
      expect(secondRes.cached).toBe(true);
      expect(secondRes.reply).toBe('Jawaban dari model AI');
      // LLM should not be called again
      expect(chatSpy).toHaveBeenCalledTimes(1);
    });

    it('should build article context containing all sections and metadata', () => {
      const context = chatService.buildArticleContext(
        MOCK_PUBLISHED_ARTICLE as never,
      );
      expect(context).toContain('Judul: Kain Tapis Lampung');
      expect(context).toContain('Topik: Kain Adat');
      expect(context).toContain('Wilayah: Lampung Selatan');
      expect(context).toContain('Suku/Kelompok Etnis: Pepadun');
      expect(context).toContain('Motif: Pucuk Rebung');
      expect(context).toContain('[Bagian: Sejarah]');
      expect(context).toContain('Tapis telah ada sejak abad ke-2 SM.');
      expect(context).toContain('[Bagian: Makna Simbolik]');
    });
  });
});
