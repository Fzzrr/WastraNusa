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
    const currentTurnText = [
      'Berikut adalah teks artikel referensi:',
      '<artikel>',
      options.articleContext,
      '</artikel>',
      '',
      '<pertanyaan_pengguna>',
      options.message,
      '</pertanyaan_pengguna>',
    ].join('\n');

    contents.push({
      role: 'user',
      parts: [{ text: currentTurnText }],
    });

    let lastError: unknown = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: 0.2, // low temperature for factual accuracy
            maxOutputTokens: 2048,
          },
        });

        const candidate = response.candidates?.[0];
        const finishReason = candidate?.finishReason;

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

        const reply = response.text?.trim();

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

    // Detect timeout
    if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('ETIMEDOUT') ||
      errorMessage.includes('DEADLINE_EXCEEDED')
    ) {
      throw new ApiError(
        'Waktu permintaan ke layanan AI habis (timeout). Silakan ulangi pertanyaan Anda.',
        504,
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
}
