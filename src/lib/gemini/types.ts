export type ChatRole = 'user' | 'model';

export interface ChatHistoryItem {
  role: ChatRole;
  text: string;
}

export interface LlmChatOptions {
  systemInstruction: string;
  articleContext: string;
  message: string;
  history?: ChatHistoryItem[];
  /**
   * Optional pre-formatted catalog context for the current article.
   * Wrapped in <katalog> tags and treated as raw data, same as <artikel>.
   */
  catalogContext?: string;
  onText?: (delta: string) => void;
  signal?: AbortSignal;
}

export interface LlmChatResult {
  reply: string;
  model: string;
  cached?: boolean;
}

export interface LlmProvider {
  readonly name: string;
  chat(options: LlmChatOptions): Promise<LlmChatResult>;
}
