export interface ChatParticipant {
  id: string;
  name: string;
  image: string | null;
}

/** Product a buyer attached to a live-chat message. */
export interface ChatAttachedProduct {
  id: string;
  slug: string;
  name: string;
  imageURL: string | null;
  price: number;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  product: ChatAttachedProduct | null;
  readAt: string | null;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  otherParticipant: ChatParticipant;
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  lastMessageAt: string | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ConversationDetail {
  id: string;
  otherParticipant: ChatParticipant;
  messages: ConversationMessage[];
}

/** Public catalog data, always mapped from DB rows rather than model output. */
export interface ChatProduct {
  slug: string;
  name: string;
  description: string | null;
  imageURL: string | null;
  priceMin: number;
  priceMax: number;
  href: string;
}

export interface ChatAnswer {
  reply: string;
  articleId: string;
  cached?: boolean;
  products?: ChatProduct[];
}

export type ChatStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'done'; data: ChatAnswer }
  | { type: 'error'; message: string };
