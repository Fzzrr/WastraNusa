export interface ChatParticipant {
  id: string;
  name: string;
  image: string | null;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
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
