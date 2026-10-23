import type { JSendResponse } from '@/lib/jsend';
import type { ChatAnswer, ChatProduct, ChatStreamEvent } from '@/types/chat';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  cached?: boolean;
  products?: ChatProduct[];
}

export type ChatApiResponse = ChatAnswer;

interface SendChatPayload {
  articleId: string;
  message: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
}

interface ChatMutationInput {
  payload: SendChatPayload;
  signal: AbortSignal;
  onText: (text: string) => void;
}

async function sendChatApi({
  payload,
  signal,
  onText,
}: ChatMutationInput): Promise<ChatApiResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (
    response.ok &&
    response.headers.get('content-type')?.includes('text/event-stream')
  ) {
    if (!response.body) throw new Error('Respons streaming tidak tersedia');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        let boundary: number;
        while ((boundary = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, boundary).trimEnd();
          buffer = buffer.slice(boundary + 1);
          if (!line.startsWith('data: ')) continue;
          const event = JSON.parse(line.slice(6)) as ChatStreamEvent;
          if (event.type === 'text') onText(event.text);
          if (event.type === 'done') return event.data;
          if (event.type === 'error') throw new Error(event.message);
        }
        if (done)
          throw new Error(
            'Koneksi terputus sebelum jawaban selesai. Silakan coba kembali.',
          );
      }
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  }

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
  const activeRequest = useRef<AbortController | null>(null);
  useEffect(() => () => activeRequest.current?.abort(), [articleId]);

  const mutation = useMutation({
    mutationFn: sendChatApi,
    retry: false,
    onError: (error: Error) => {
      if (error.name === 'AbortError') return;
      toast.error(error.message || 'Gagal memproses pertanyaan');
    },
  });

  const sendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || mutation.isPending || activeRequest.current) return;
    const request = new AbortController();
    activeRequest.current = request;
    const modelId = `mod_${crypto.randomUUID()}`;
    let scheduled: ReturnType<typeof setTimeout> | undefined;
    let partialText = '';
    const updateMessage = (message: ChatMessage) => {
      if (request.signal.aborted) return;
      setMessages((prev) =>
        prev.some((item) => item.id === modelId)
          ? prev.map((item) => (item.id === modelId ? message : item))
          : [...prev, message],
      );
    };

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    // Keep up to 8 recent messages for conversation history
    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.role,
      text: (
        m.text +
        (m.products?.length
          ? '\nProduk yang ditampilkan: ' +
            m.products.map((product) => product.name).join(', ')
          : '')
      ).slice(0, 1000),
    }));

    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await mutation.mutateAsync({
        payload: {
          articleId,
          message: trimmed,
          history: historyPayload.length > 0 ? historyPayload : undefined,
        },
        signal: request.signal,
        onText: (text) => {
          partialText = text;
          if (scheduled) return;
          // Coalesce fast token bursts to avoid re-rendering every chunk.
          scheduled = setTimeout(() => {
            scheduled = undefined;
            updateMessage({
              id: modelId,
              role: 'model',
              text: partialText,
              timestamp: new Date(),
            });
          }, 40);
        },
      });
      clearTimeout(scheduled);

      const modelMessage: ChatMessage = {
        id: modelId,
        role: 'model',
        text: result.reply,
        timestamp: new Date(),
        cached: result.cached,
        products: result.products,
      };

      updateMessage(modelMessage);
    } catch {
      clearTimeout(scheduled);
      // A disconnected partial answer must not look like a completed answer.
      setMessages((prev) => prev.filter((item) => item.id !== modelId));
    } finally {
      if (activeRequest.current === request) activeRequest.current = null;
    }
  };

  const clearChat = () => {
    activeRequest.current?.abort();
    setMessages([]);
  };

  return {
    messages,
    isOpen,
    isMinimized,
    isPending: mutation.isPending,
    isStreaming: mutation.isPending && messages.at(-1)?.role === 'model',
    setIsOpen,
    setIsMinimized,
    sendMessage,
    clearChat,
  };
}
