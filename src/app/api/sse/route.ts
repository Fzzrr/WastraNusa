import { withApiAuth } from '@/lib/api-handler';
import eventBus, {
  SSE_EVENTS,
  type SseEvent,
  getUserEvent,
} from '@/lib/chat/event-bus';
import { logger } from '@/lib/logger';

// EventEmitter requires the Node runtime; streaming requires a dynamic route.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUBSCRIBED_EVENTS: SseEvent[] = [
  SSE_EVENTS.NEW_MESSAGE,
  SSE_EVENTS.CONVERSATION_UPDATED,
  SSE_EVENTS.MESSAGE_STATUSES_UPDATED,
];

const HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Server-Sent Events stream scoped to the authenticated user. Subscribes to the
 * per-user channel for each chat event and relays them to the client, with a
 * periodic heartbeat so proxies keep the connection open. All listeners and the
 * heartbeat are torn down when the request is aborted.
 */
export const GET = withApiAuth(async ({ req, userId }) => {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const write = (chunk: string) => {
        if (closed) return;
        controller.enqueue(encoder.encode(chunk));
      };

      // Map each subscribed event to its bound handler so we can detach them.
      const handlers = SUBSCRIBED_EVENTS.map((event) => {
        const channel = getUserEvent(event, userId);
        const handler = (payload: unknown) => {
          write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
        };
        eventBus.on(channel, handler);
        return { channel, handler };
      });

      logger.info('SSE connection established', {
        userId,
        events: SUBSCRIBED_EVENTS.length,
      });

      const heartbeat = setInterval(() => {
        write(`: keep-alive\n\n`);
      }, HEARTBEAT_INTERVAL_MS);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        for (const { channel, handler } of handlers) {
          eventBus.off(channel, handler);
        }
        try {
          controller.close();
        } catch {
          // Controller may already be closed; ignore.
        }
        logger.info('SSE connection closed', { userId });
      };

      req.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
});
