import { EventEmitter } from 'events';

/**
 * SSE event names used across the live-chat feature.
 *
 * Payload shapes emitted by the conversation service (see
 * `src/services/conversation.service.ts`):
 *
 * - NEW_MESSAGE
 *     { conversationId: string; message: ConversationMessage }
 *     Emitted to BOTH participants' channels when a message is created.
 *
 * - CONVERSATION_UPDATED
 *     { conversationId: string }
 *     Emitted to BOTH participants' channels when a conversation's state
 *     changes (new message, read status change) so lists can refresh.
 *
 * - MESSAGE_STATUSES_UPDATED
 *     { conversationId: string; readerId: string; readAt: string }
 *     Emitted to the OTHER participant's channel (the sender whose messages
 *     were just read) when the reader opens / marks a conversation read.
 */
export const SSE_EVENTS = {
  NEW_MESSAGE: 'NEW_MESSAGE',
  CONVERSATION_UPDATED: 'CONVERSATION_UPDATED',
  MESSAGE_STATUSES_UPDATED: 'MESSAGE_STATUSES_UPDATED',
} as const;

export type SseEvent = (typeof SSE_EVENTS)[keyof typeof SSE_EVENTS];

/**
 * Build a per-user channel name so each connected SSE client only receives
 * events addressed to its own user id.
 */
export const getUserEvent = (event: SseEvent, userId: string): string =>
  `${event}:${userId}`;

const globalForEventBus = global as unknown as {
  chatEventBus?: EventEmitter;
};

/**
 * Singleton EventEmitter stored on `global` so it survives HMR in dev and is
 * shared across all route modules in a single Node process.
 */
const eventBus =
  globalForEventBus.chatEventBus ??
  (() => {
    const emitter = new EventEmitter();
    // Each SSE connection registers up to 3 listeners; raise the ceiling so a
    // modest number of concurrent clients doesn't trip the warning.
    emitter.setMaxListeners(50);
    return emitter;
  })();

if (process.env.NODE_ENV !== 'production') {
  globalForEventBus.chatEventBus = eventBus;
}

export default eventBus;
