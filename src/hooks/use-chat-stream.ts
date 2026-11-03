'use client';

import { chatKeys } from '@/hooks/use-conversations';
import { authClient } from '@/lib/auth/auth-client';
import type { ConversationMessage } from '@/types/chat';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

interface NewMessageEvent {
  conversationId: string;
  message: ConversationMessage;
}

interface ConversationUpdatedEvent {
  conversationId: string;
}

interface MessageStatusesUpdatedEvent {
  conversationId: string;
  readerId: string;
  readAt: string;
}

/**
 * Opens a single Server-Sent-Events connection (`/api/sse`, cookie-auth,
 * same-origin) while a user is signed in, and invalidates the relevant
 * React Query caches when the server pushes a chat event. EventSource
 * handles reconnection natively, so this hook does not retry manually.
 */
export function useChatStream() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  useEffect(() => {
    // Client-only, and only once we actually have a signed-in user.
    if (typeof window === 'undefined' || !userId) return;

    const source = new EventSource('/api/sse');

    const invalidateConversation = (conversationId: string) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(conversationId),
      });
    };
    const invalidateList = () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    };

    const handleNewMessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as NewMessageEvent;
        invalidateConversation(payload.conversationId);
        invalidateList();
      } catch {
        // Ignore malformed payloads; the next poll/refetch will reconcile.
      }
    };

    const handleConversationUpdated = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as ConversationUpdatedEvent;
        invalidateConversation(payload.conversationId);
        invalidateList();
      } catch {
        // Ignore malformed payloads.
      }
    };

    const handleStatusesUpdated = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as MessageStatusesUpdatedEvent;
        invalidateConversation(payload.conversationId);
      } catch {
        // Ignore malformed payloads.
      }
    };

    source.addEventListener('NEW_MESSAGE', handleNewMessage);
    source.addEventListener('CONVERSATION_UPDATED', handleConversationUpdated);
    source.addEventListener('MESSAGE_STATUSES_UPDATED', handleStatusesUpdated);

    return () => {
      source.removeEventListener('NEW_MESSAGE', handleNewMessage);
      source.removeEventListener(
        'CONVERSATION_UPDATED',
        handleConversationUpdated,
      );
      source.removeEventListener(
        'MESSAGE_STATUSES_UPDATED',
        handleStatusesUpdated,
      );
      source.close();
    };
  }, [userId, queryClient]);
}
