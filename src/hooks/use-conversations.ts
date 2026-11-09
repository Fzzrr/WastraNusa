import { fetchApi, mutateApi } from '@/lib/api-client';
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
    mutationFn: (input: {
      content: string;
      productId?: string;
      variantId?: string;
    }) =>
      mutateApi<ConversationMessage>(
        `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
        'POST',
        input,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}
