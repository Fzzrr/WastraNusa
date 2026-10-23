import { POST } from '@/app/api/chat/route';
import { EncyclopediaChatWidget } from '@/components/encyclopedia/encyclopedia-chat-widget';
import { articleContextCache, chatReplyCache } from '@/lib/gemini/cache';
import { llmService } from '@/lib/gemini/llm.service';
import { chatRateLimiter } from '@/lib/gemini/rate-limiter';
import { articleRepository } from '@/repositories/article.repository';
import { productRepository } from '@/repositories/product.repository';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
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
    vi.mocked(articleRepository.findByIdOrSlug).mockResolvedValue(
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
});
