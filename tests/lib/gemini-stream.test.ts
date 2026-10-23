// @vitest-environment node
import { GeminiProvider } from '@/lib/gemini/gemini.provider';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({ stream: vi.fn(), generate: vi.fn() }));
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContentStream: sdk.stream,
      generateContent: sdk.generate,
    };
  },
}));

describe('Gemini streaming transport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
  const options = {
    systemInstruction: 'test',
    articleContext: 'Article',
    message: 'Question',
    catalogContext: 'Catalog',
  };

  it('forwards chunks as they arrive and uses one SDK attempt with a bounded timeout', async () => {
    sdk.stream.mockResolvedValue(
      (async function* () {
        yield { text: 'Hello ', candidates: [{}] };
        yield { text: 'there.', candidates: [{ finishReason: 'STOP' }] };
      })(),
    );
    const onText = vi.fn();
    const result = await new GeminiProvider().chat({ ...options, onText });
    expect(onText.mock.calls.map(([delta]) => delta)).toEqual([
      'Hello ',
      'there.',
    ]);
    expect(result.reply).toBe('Hello there.');
    expect(sdk.generate).not.toHaveBeenCalled();
    const request = sdk.stream.mock.calls[0][0];
    expect(request.contents[0].parts[0].text).toContain(
      '<artikel>\nArticle\n</artikel>',
    );
    expect(request.contents[0].parts[0].text).toContain(
      '<katalog>\nCatalog\n</katalog>',
    );
  });

  it('does not retry another model after sending partial content', async () => {
    sdk.stream.mockResolvedValue(
      (async function* () {
        yield { text: 'Partial', candidates: [{}] };
        throw new Error('503 UNAVAILABLE');
      })(),
    );
    await expect(
      new GeminiProvider().chat({ ...options, onText: vi.fn() }),
    ).rejects.toThrow();
    expect(sdk.stream).toHaveBeenCalledTimes(1);
  });
});
