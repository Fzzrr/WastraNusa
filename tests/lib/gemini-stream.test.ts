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
    expect(request.config.httpOptions).toEqual({
      retryOptions: { attempts: 1 },
    });
    expect(request.config.abortSignal).toBeInstanceOf(AbortSignal);
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

  it('tries the existing fallback when the primary is silent instead of consuming the whole deadline', async () => {
    vi.useFakeTimers();
    vi.stubEnv('GEMINI_MODEL', 'gemini-flash-latest');
    sdk.stream
      .mockImplementationOnce(
        ({ config }) =>
          new Promise((_, reject) => {
            config.abortSignal.addEventListener(
              'abort',
              () => reject(config.abortSignal.reason),
              { once: true },
            );
          }),
      )
      .mockResolvedValueOnce(
        (async function* () {
          yield {
            text: 'Jawaban dari artikel.',
            candidates: [{ finishReason: 'STOP' }],
          };
        })(),
      );
    const onText = vi.fn();
    const result = new GeminiProvider().chat({ ...options, onText });
    await vi.advanceTimersByTimeAsync(15000);
    await expect(result).resolves.toMatchObject({
      reply: 'Jawaban dari artikel.',
      model: 'gemini-3.5-flash',
    });
    expect(sdk.stream).toHaveBeenCalledTimes(2);
    expect(sdk.stream.mock.calls[0][0].config.abortSignal.aborted).toBe(true);
    expect(onText).toHaveBeenCalledExactlyOnceWith('Jawaban dari artikel.');
  });

  it('does not cut off an active stream after the first-response timeout interval', async () => {
    vi.useFakeTimers();
    sdk.stream.mockResolvedValue(
      (async function* () {
        yield { text: 'Jawaban ', candidates: [{}] };
        await new Promise((resolve) => setTimeout(resolve, 20000));
        yield { text: 'lengkap.', candidates: [{ finishReason: 'STOP' }] };
      })(),
    );
    const result = new GeminiProvider().chat({ ...options, onText: vi.fn() });
    await vi.advanceTimersByTimeAsync(20000);
    await expect(result).resolves.toMatchObject({ reply: 'Jawaban lengkap.' });
    expect(sdk.stream).toHaveBeenCalledTimes(1);
  });

  it('stops an aborted request before calling Gemini', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      new GeminiProvider().chat({
        ...options,
        onText: vi.fn(),
        signal: controller.signal,
      }),
    ).rejects.toThrow();
    expect(sdk.stream).not.toHaveBeenCalled();
  });

  it('maps an upstream SDK abort to 504 instead of an unexplained 500', async () => {
    sdk.stream.mockRejectedValue(
      new DOMException('This operation was aborted', 'AbortError'),
    );
    await expect(
      new GeminiProvider().chat({ ...options, onText: vi.fn() }),
    ).rejects.toMatchObject({ status: 504 });
    expect(sdk.stream).toHaveBeenCalledTimes(1);
  });

  it('maps the overall deadline to 504 without starting another model', async () => {
    const deadline = new AbortController();
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(deadline.signal);
    sdk.stream.mockImplementation(async () => {
      deadline.abort(new DOMException('Deadline exceeded', 'TimeoutError'));
      throw deadline.signal.reason;
    });
    await expect(
      new GeminiProvider().chat({ ...options, onText: vi.fn() }),
    ).rejects.toMatchObject({ status: 504 });
    expect(sdk.stream).toHaveBeenCalledTimes(1);
  });

  it('preserves caller cancellation during a request rather than reporting a service failure', async () => {
    const caller = new AbortController();
    sdk.stream.mockImplementation(async () => {
      caller.abort();
      throw new DOMException('This operation was aborted', 'AbortError');
    });
    await expect(
      new GeminiProvider().chat({
        ...options,
        onText: vi.fn(),
        signal: caller.signal,
      }),
    ).rejects.toBe(caller.signal.reason);
    expect(sdk.stream).toHaveBeenCalledTimes(1);
  });
});
