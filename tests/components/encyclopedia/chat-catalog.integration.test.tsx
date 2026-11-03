import { POST } from '@/app/api/chat/route';
import { EncyclopediaChatWidget } from '@/components/encyclopedia/encyclopedia-chat-widget';
import { articleContextCache, chatReplyCache } from '@/lib/gemini/cache';
import { llmService } from '@/lib/gemini/llm.service';
import { chatRateLimiter } from '@/lib/gemini/rate-limiter';
import { articleRepository } from '@/repositories/article.repository';
import { productRepository } from '@/repositories/product.repository';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const article = {
  id: 'art-1',
  slug: 'batik-kawung',
  title: 'Batik Kawung',
  topic: 'Batik',
  motifLabel: 'Kawung',
  province: 'Yogyakarta',
  clothingType: 'Kemeja',
  status: 'published',
  sections: [
    { title: 'Makna', content: 'Kawung melambangkan pengendalian diri.' },
  ],
};
const product = {
  id: 'product-1',
  articleId: 'art-1',
  article: { id: 'art-1', title: 'Batik Kawung' },
  slug: 'kemeja-kawung',
  name: 'Kemeja Kawung',
  description: 'Katun lengan panjang.',
  imageURL: 'https://example.com/kawung.jpg',
  price: 200000,
  clothingType: 'Kemeja',
  province: 'Yogyakarta',
  island: 'Jawa',
  status: 'active',
  updatedAt: new Date(),
  variants: [
    {
      id: 'variant-1',
      name: 'M',
      type: 'size',
      stock: 2,
      price: 225000,
      updatedAt: new Date(),
    },
  ],
};

describe('chat UI → API → article/catalog service → UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    articleContextCache.clear();
    chatReplyCache.clear();
    chatRateLimiter.reset();
    Element.prototype.scrollIntoView = vi.fn();
    vi.mocked(articleRepository.findChatArticle).mockResolvedValue(
      article as never,
    );
    vi.mocked(productRepository.findChatProducts).mockResolvedValue([
      product,
    ] as never);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        return POST(new Request('http://localhost/api/chat', init), {
          params: Promise.resolve({}),
        });
      }),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  function mount() {
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    return render(
      <QueryClientProvider client={client}>
        <EncyclopediaChatWidget
          key="batik-kawung"
          articleId="batik-kawung"
          articleTitle="Batik Kawung"
          isOpen
        />
      </QueryClientProvider>,
    );
  }

  function send(text: string) {
    const input = screen.getByPlaceholderText(
      'Tanyakan sesuatu tentang artikel ini...',
    );
    fireEvent.change(input, { target: { value: text } });
    fireEvent.submit(input.closest('form')!);
  }

  it('shows partial text before completion, hides split selectors, and attaches cards at the end', async () => {
    const finish = Promise.withResolvers<void>();
    vi.spyOn(llmService, 'chat').mockImplementation(async (options) => {
      options.onText?.('Kawung melambangkan pengendalian diri. [pro');
      await finish.promise;
      options.onText?.('duk:1]');
      return {
        reply: 'Kawung melambangkan pengendalian diri. [produk:1]',
        model: 'test',
      };
    });
    mount();
    send('Apa maknanya dan ada kemeja yang cocok?');
    try {
      await screen.findByText('Kawung melambangkan pengendalian diri.');
      expect(screen.queryByText(/\[pro/)).toBeNull();
      expect(screen.queryByRole('link')).toBeNull();
      expect(
        screen
          .getByPlaceholderText('Tanyakan sesuatu tentang artikel ini...')
          .hasAttribute('disabled'),
      ).toBe(true);
    } finally {
      finish.resolve();
    }
    const link = await screen.findByRole('link', { name: /Kemeja Kawung/ });
    expect(link.getAttribute('href')).toBe('/catalog/kemeja-kawung');
  });

  it('reports a mid-stream error without retaining or caching an incomplete answer', async () => {
    const fail = Promise.withResolvers<void>();
    const model = vi
      .spyOn(llmService, 'chat')
      .mockImplementation(async (options) => {
        options.onText?.('Jawaban belum selesai.');
        await fail.promise;
        throw new Error('upstream disconnected');
      });
    mount();
    send('Jelaskan motifnya');
    try {
      await screen.findByText('Jawaban belum selesai.');
    } finally {
      fail.resolve();
    }
    await waitFor(() =>
      expect(screen.queryByText('Jawaban belum selesai.')).toBeNull(),
    );
    model.mockResolvedValue({ reply: 'Jawaban lengkap.', model: 'test' });
    send('Jelaskan motifnya');
    await screen.findByText('Jawaban lengkap.');
    expect(model).toHaveBeenCalledTimes(2);
  });

  it('combines the contextual answer with real image, available variant price, description and detail link', async () => {
    const model = vi.spyOn(llmService, 'chat').mockResolvedValue({
      reply:
        'Kawung melambangkan pengendalian diri. Berikut pilihan yang sesuai. [produk:1] [produk:900]',
      model: 'test',
    });
    mount();
    send('Apa maknanya, dan ada kemeja untuk dibeli?');
    const link = await screen.findByRole('link', { name: /Kemeja Kawung/ });
    expect(link.getAttribute('href')).toBe('/catalog/kemeja-kawung');
    expect(
      screen.getByRole('img', { name: 'Kemeja Kawung' }).getAttribute('src'),
    ).toContain('kawung.jpg');
    expect(screen.getByText(/225\.000/)).toBeDefined();
    expect(screen.getByText('Katun lengan panjang.')).toBeDefined();
    expect(
      screen.getByText(/Kawung melambangkan pengendalian diri\. Berikut/),
    ).toBeDefined();
    expect(screen.queryByText(/\[produk:/)).toBeNull();
    expect(model.mock.calls[0][0].articleContext).toContain(
      'pengendalian diri',
    );
  });

  it('answers an article-only question without product cards', async () => {
    vi.spyOn(llmService, 'chat').mockResolvedValue({
      reply: 'Kawung melambangkan pengendalian diri.',
      model: 'test',
    });
    mount();
    send('Apa makna Kawung?');
    await screen.findByText('Kawung melambangkan pengendalian diri.');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('keeps an informative English answer with no card when products are sold out', async () => {
    vi.mocked(productRepository.findChatProducts).mockResolvedValue([
      {
        ...product,
        variants: [{ ...product.variants[0], stock: 0 }],
      },
    ] as never);
    const model = vi.spyOn(llmService, 'chat').mockResolvedValue({
      reply:
        'Kawung symbolises self-control. No matching products are currently available. [produk:1]',
      model: 'test',
    });
    mount();
    send('What does Kawung mean, and can I buy a matching shirt?');
    await screen.findByText(/No matching products are currently available/);
    expect(screen.queryByRole('link')).toBeNull();
    expect(model.mock.calls[0][0].catalogContext).toContain(
      'Tidak ada produk yang cocok',
    );
  });

  it('uses the current user needs and previously displayed product names in follow-up history', async () => {
    const model = vi
      .spyOn(llmService, 'chat')
      .mockResolvedValueOnce({
        reply: 'Berikut pilihan sesuai anggaran. [produk:1]',
        model: 'test',
      })
      .mockResolvedValueOnce({
        reply: 'Ukuran M tersedia untuk pilihan tersebut. [produk:1]',
        model: 'test',
      });
    mount();
    send('Cari kemeja katun di bawah Rp250.000.');
    await screen.findByRole('link', { name: /Kemeja Kawung/ });
    await waitFor(() =>
      expect(
        screen
          .getByPlaceholderText('Tanyakan sesuatu tentang artikel ini...')
          .hasAttribute('disabled'),
      ).toBe(false),
    );
    send('Ada ukuran M untuk pilihan tadi?');
    await screen.findByText('Ukuran M tersedia untuk pilihan tersebut.');
    const history = model.mock.calls[1][0].history!;
    expect(history[0].text).toContain('di bawah Rp250.000');
    expect(history[1].text).toContain('Kemeja Kawung');
  });

  it('resets conversation when the opened article changes', async () => {
    const model = vi
      .spyOn(llmService, 'chat')
      .mockResolvedValue({ reply: 'Jawaban artikel pertama.', model: 'test' });
    const view = mount();
    send('Apa makna Kawung?');
    await screen.findByText('Jawaban artikel pertama.');
    vi.mocked(articleRepository.findChatArticle).mockResolvedValue({
      ...article,
      id: 'art-2',
      slug: 'mega-mendung',
      title: 'Mega Mendung',
      motifLabel: 'Mega Mendung',
    } as never);
    vi.mocked(productRepository.findChatProducts).mockResolvedValue([]);
    const client = new QueryClient();
    view.rerender(
      <QueryClientProvider client={client}>
        <EncyclopediaChatWidget
          key="mega-mendung"
          articleId="mega-mendung"
          articleTitle="Mega Mendung"
          isOpen
        />
      </QueryClientProvider>,
    );
    expect(screen.queryByText('Jawaban artikel pertama.')).toBeNull();
    send('Apa maknanya?');
    await waitFor(() => expect(model).toHaveBeenCalledTimes(2));
    expect(model.mock.calls[1][0].history).toBeUndefined();
    expect(model.mock.calls[1][0].articleContext).toContain('Mega Mendung');
  });
});
