import type { JSendResponse } from '@/lib/jsend';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  cached?: boolean;
}

export interface ChatApiResponse {
  reply: string;
  articleId: string;
  cached?: boolean;
}

interface SendChatPayload {
  articleId: string;
  message: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
}

async function sendChatApi(payload: SendChatPayload): Promise<ChatApiResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as JSendResponse<ChatApiResponse>;

  if (body.status === 'success') {
    return body.data as ChatApiResponse;
  }

  if (body.status === 'fail') {
    const message =
      typeof body.data === 'object' &&
      body.data !== null &&
      'message' in body.data
        ? String((body.data as { message: unknown }).message)
        : 'Gagal mengirim pesan';
    throw new Error(message);
  }

  throw new Error(body.message || 'Terjadi kesalahan sistem');
}

export function useArticleChat(articleId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const mutation = useMutation({
    mutationFn: sendChatApi,
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memproses pertanyaan');
    },
  });

  const sendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || mutation.isPending) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    // Keep up to 8 recent messages for conversation history
    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.role,
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await mutation.mutateAsync({
        articleId,
        message: trimmed,
        history: historyPayload.length > 0 ? historyPayload : undefined,
      });

      const modelMessage: ChatMessage = {
        id: `mod_${Date.now()}`,
        role: 'model',
        text: result.reply,
        timestamp: new Date(),
        cached: result.cached,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch {
      // Error is handled in onError with toast
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    isOpen,
    isMinimized,
    isPending: mutation.isPending,
    setIsOpen,
    setIsMinimized,
    sendMessage,
    clearChat,
  };
}
