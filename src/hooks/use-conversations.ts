import type { JSendResponse } from '@/lib/jsend';
import type {
  ConversationDetail,
  ConversationMessage,
  ConversationSummary,
} from '@/types/chat';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --------------- Query Key Factory ---------------

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
};

// --------------- Fetch Helpers ---------------

async function parseJSend<T>(response: Response): Promise<T> {
  const body = (await response.json()) as JSendResponse<T>;

  if (body.status === 'success') {
    return body.data as T;
  }

  if (body.status === 'fail') {
    const message =
      typeof body.data === 'object' &&
      body.data !== null &&
      'message' in body.data
        ? String((body.data as { message: unknown }).message)
        : 'Request failed';
    throw new Error(message);
  }

  throw new Error(body.message);
}

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSend<T>(response);
}

async function mutateApi<T>(
  path: string,
  method: 'POST' | 'PATCH',
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseJSend<T>(response);
}

// --------------- Query Hooks ---------------

/**
 * The authenticated user's conversation list, newest activity first.
 * `refetchInterval` polls while the tab is visible (e.g. for an unread badge).
 */
export function useConversations(options?: {
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: () => fetchApi<ConversationSummary[]>('/api/conversations'),
    staleTime: 1000 * 15,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * A single conversation with its messages. Fetching also marks the
 * conversation's incoming messages as read (server-side side effect).
 */
export function useConversation(id: string | null | undefined) {
  return useQuery({
    queryKey: chatKeys.conversation(id ?? ''),
    queryFn: () =>
      fetchApi<ConversationDetail>(
        `/api/conversations/${encodeURIComponent(id ?? '')}`,
      ),
    enabled: !!id,
  });
}

// --------------- Mutation Hooks ---------------

/**
 * Start (or reuse) a conversation with another user.
 */
export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (otherUserId: string) =>
      mutateApi<ConversationSummary>('/api/conversations', 'POST', {
        otherUserId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

/**
 * Send a message in the given conversation.
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      mutateApi<ConversationMessage>(
        `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
        'POST',
        { content },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

/**
 * Explicitly mark a conversation's incoming messages as read.
 */
export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      mutateApi<{ readAt: string }>(
        `/api/conversations/${encodeURIComponent(conversationId)}/read`,
        'POST',
      ),
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}
