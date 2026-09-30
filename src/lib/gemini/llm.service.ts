import { GeminiProvider } from './gemini.provider';
import {
  type LlmChatOptions,
  type LlmChatResult,
  type LlmProvider,
} from './types';

/**
 * Service orchestrator for LLM providers.
 * Allows easy switching of LLM providers (e.g. Gemini, OpenRouter)
 * and holds the structure for automated provider fallback.
 */
export class LlmService {
  private providers: Map<string, LlmProvider> = new Map();
  private defaultProviderName: string;

  constructor() {
    // Register primary Gemini provider
    const gemini = new GeminiProvider();
    this.providers.set(gemini.name, gemini);

    // Default provider determined by environment variable (defaults to gemini)
    this.defaultProviderName = process.env.LLM_PROVIDER || 'gemini';
  }

  /**
   * Register a custom or fallback provider (e.g. OpenRouter, OpenAI)
   */
  public registerProvider(provider: LlmProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Sends chat prompt to the active provider, with prepared fallback architecture.
   */
  public async chat(options: LlmChatOptions): Promise<LlmChatResult> {
    const activeProviderName =
      process.env.LLM_PROVIDER || this.defaultProviderName;
    const provider = this.providers.get(activeProviderName);

    if (!provider) {
      // Fall back to default gemini provider if specified provider is unknown
      const fallback = this.providers.get('gemini');
      if (!fallback) {
        throw new Error(
          `LLM provider '${activeProviderName}' is not registered`,
        );
      }
      return fallback.chat(options);
    }

    try {
      return await provider.chat(options);
    } catch (primaryError) {
      // Structure for optional secondary fallback provider (e.g. OpenRouter)
      const fallbackProviderName = process.env.LLM_FALLBACK_PROVIDER;
      if (
        fallbackProviderName &&
        fallbackProviderName !== activeProviderName &&
        this.providers.has(fallbackProviderName)
      ) {
        const secondary = this.providers.get(fallbackProviderName)!;
        return await secondary.chat(options);
      }

      // Re-throw if no fallback is configured or available
      throw primaryError;
    }
  }
}

export const llmService = new LlmService();
