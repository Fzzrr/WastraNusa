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
