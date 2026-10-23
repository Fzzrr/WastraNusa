import { ApiError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { GoogleGenAI } from '@google/genai';

import {
  type LlmChatOptions,
  type LlmChatResult,
  type LlmProvider,
} from './types';

const FALLBACK_MODELS = [
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
];

const FIRST_RESPONSE_TIMEOUT_MS = 15_000;

export class GeminiProvider implements LlmProvider {
  public readonly name = 'gemini';
  private client: GoogleGenAI | null = null;
  private readonly defaultModel: string;

  constructor() {
    this.defaultModel = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  }

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error('GEMINI_API_KEY environment variable is not configured');
      throw new ApiError(
        'Layanan AI belum dikonfigurasi. Hubungi administrator.',
        500,
      );
    }

    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey });
    }

    return this.client;
  }

  public async chat(options: LlmChatOptions): Promise<LlmChatResult> {
    const signal = options.signal
      ? AbortSignal.any([options.signal, AbortSignal.timeout(60_000)])
      : AbortSignal.timeout(60_000);
    const ai = this.getClient();
    const configuredModel = process.env.GEMINI_MODEL || this.defaultModel;

    // Sequence of models to try if the primary one experiences high demand (503) or unavailability
    const candidateModels = Array.from(
      new Set([configuredModel, ...FALLBACK_MODELS]),
    );

    // Build conversation contents
    const contents: Array<{
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }> = [];

    // Append validated previous history if provided
    if (options.history && options.history.length > 0) {
      for (const item of options.history) {
        contents.push({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.text }],
        });
      }
    }

    // Format current turn with delimited article context and user message
    const turnParts = [
      'Berikut adalah teks artikel referensi:',
      '<artikel>',
      options.articleContext,
      '</artikel>',
    ];

    // Catalog data is only appended when present, keeping the single-article
    // shape unchanged for callers that do not supply a catalog.
    if (options.catalogContext) {
      turnParts.push(
        '',
        'Berikut adalah data katalog produk WastraNusa yang terkait:',
        '<katalog>',
        options.catalogContext,
        '</katalog>',
      );
    }

    turnParts.push(
      '',
      '<pertanyaan_pengguna>',
      options.message,
      '</pertanyaan_pengguna>',
    );

    const currentTurnText = turnParts.join('\n');

    contents.push({
      role: 'user',
      parts: [{ text: currentTurnText }],
    });

    let lastError: unknown = null;

    for (const model of candidateModels) {
      let emitted = false;
      let firstResponseTimedOut = false;
      let firstResponseTimer: ReturnType<typeof setTimeout> | undefined;
      const attempt = new AbortController();
      const attemptSignal = AbortSignal.any([signal, attempt.signal]);
      const started = Date.now();
      try {
        signal.throwIfAborted();
        // A silent model must leave time for the existing fallbacks. Unlike
        // an HTTP timeout, this timer stops once answer text starts flowing.
        firstResponseTimer = setTimeout(() => {
          firstResponseTimedOut = true;
          attempt.abort(
            new DOMException('No first response from model', 'TimeoutError'),
          );
        }, FIRST_RESPONSE_TIMEOUT_MS);
        const request = {
          model,
          contents,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: 0.2, // low temperature for factual accuracy
            maxOutputTokens: 2048,
            abortSignal: attemptSignal,
            // Let the existing model fallback handle retries, rather than
            // multiplying SDK retries by every fallback candidate.
            // The first-response watchdog is cleared on visible progress;
            // the overall deadline still bounds the complete operation.
            httpOptions: { retryOptions: { attempts: 1 } },
          },
        };
        let text = '';
        let finishReason: string | undefined;
        if (options.onText) {
          const stream = await ai.models.generateContentStream(request);
          for await (const chunk of stream) {
            signal.throwIfAborted();
            finishReason = chunk.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') break;
            const delta = chunk.text;
            if (delta) {
              clearTimeout(firstResponseTimer);
              emitted = true;
              text += delta;
              options.onText(delta);
            }
          }
        } else {
          const response = await ai.models.generateContent(request);
          clearTimeout(firstResponseTimer);
          text = response.text || '';
          finishReason = response.candidates?.[0]?.finishReason;
        }

        if (finishReason === 'SAFETY') {
          logger.warn('Gemini response was blocked by safety filters', {
            model,
          });
          return {
            reply:
              'Maaf, respons tidak dapat ditampilkan karena terdeteksi melanggar kebijakan keamanan konten.',
            model,
          };
        }

        const reply = text.trim();

        if (!reply) {
          return {
            reply:
              'Maaf, saya tidak dapat menemukan informasi mengenai pertanyaan tersebut di dalam artikel ini.',
            model,
          };
        }

        return {
          reply,
          model,
        };
      } catch (err: unknown) {
        if (options.signal?.aborted) throw options.signal.reason;
        if (signal.aborted) {
          this.handleTimeout(model);
        }
        if (firstResponseTimedOut && !emitted) {
          lastError = new ApiError(
            'Waktu permintaan ke layanan AI habis (timeout). Silakan ulangi pertanyaan Anda.',
            504,
          );
          logger.warn(
            'Gemini did not return a first response; trying next candidate model',
            {
              model,
              elapsedMs: Date.now() - started,
            },
          );
          continue;
        }
        // Never append a second model's answer after a partial response.
        if (emitted) this.handleError(err, model);
        lastError = err;
        const errorMessage = err instanceof Error ? err.message : String(err);

        // Check if this error is temporary high demand (503 UNAVAILABLE) or 404
        const isHighDemandOrUnavailable =
          errorMessage.includes('503') ||
          errorMessage.includes('UNAVAILABLE') ||
          errorMessage.includes('high demand') ||
          errorMessage.includes('Spikes in demand') ||
          errorMessage.includes('404') ||
          errorMessage.includes('NOT_FOUND');

        if (isHighDemandOrUnavailable) {
          logger.warn(
            `Model ${model} unavailable or experiencing high demand. Trying next candidate model...`,
            { error: errorMessage.slice(0, 150) },
          );
          continue; // Try next model in candidateModels
        }

        // For non-recoverable errors (invalid API key, 429 quota, etc.), stop and handle immediately
        this.handleError(err, model);
      } finally {
        clearTimeout(firstResponseTimer);
      }
    }

    // If all candidate models failed, handle the last error
    this.handleError(lastError, configuredModel);
    throw new ApiError(
      'Gagal memproses jawaban dari asisten AI. Silakan coba beberapa saat lagi.',
      500,
    );
  }

  private handleError(err: unknown, model: string): never {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const normalizedMessage = errorMessage.toLowerCase();
    // Caller cancellation is handled before reaching this method. An abort
    // from the SDK/transport must not become an unexplained HTTP 500.
    if (
      (err instanceof Error &&
        ['AbortError', 'TimeoutError'].includes(err.name)) ||
      normalizedMessage.includes('operation was aborted') ||
      normalizedMessage.includes('timeout') ||
      normalizedMessage.includes('etimedout') ||
      normalizedMessage.includes('deadline_exceeded')
    ) {
      this.handleTimeout(model);
    }

    // Log error safely without exposing keys or credentials
    logger.error('Gemini API call failed', {
      model,
      error: errorMessage.slice(0, 300),
    });

    // Detect 503 High Demand / Spikes in demand
    if (
      errorMessage.includes('503') ||
      errorMessage.includes('UNAVAILABLE') ||
      errorMessage.includes('high demand') ||
      errorMessage.includes('Spikes in demand')
    ) {
      throw new ApiError(
        'Model AI saat ini sedang mengalami lonjakan beban tinggi (high demand). Silakan coba beberapa saat lagi.',
        503,
      );
    }

    // Detect quota / rate limit exhaustion
    if (
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('Quota exceeded')
    ) {
      throw new ApiError(
        'Batas kuota layanan AI saat ini sedang penuh. Silakan coba beberapa saat lagi.',
        429,
      );
    }

    // Detect invalid API key / authentication
    if (
      errorMessage.includes('API_KEY_INVALID') ||
      errorMessage.includes('401') ||
      errorMessage.includes('Unauthorized')
    ) {
      throw new ApiError(
        'Konfigurasi layanan AI tidak valid. Hubungi administrator.',
        500,
      );
    }

    // Detect model not found / deprecated model
    if (
      errorMessage.includes('404') ||
      errorMessage.includes('NOT_FOUND') ||
      errorMessage.includes('no longer available') ||
      errorMessage.includes('is not found for API version')
    ) {
      throw new ApiError(
        'Model AI yang dikonfigurasi tidak tersedia. Silakan gunakan gemini-2.5-flash atau gemini-2.0-flash.',
        500,
      );
    }

    throw new ApiError(
      'Gagal memproses jawaban dari asisten AI. Silakan coba beberapa saat lagi.',
      500,
    );
  }

  private handleTimeout(model: string): never {
    logger.warn('Gemini request timed out or was aborted upstream', { model });
    throw new ApiError(
      'Waktu permintaan ke layanan AI habis (timeout). Silakan ulangi pertanyaan Anda.',
      504,
    );
  }
}
