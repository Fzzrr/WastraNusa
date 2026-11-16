import { withApiPublic } from '@/lib/api-handler';
import { ApiError } from '@/lib/error';
import {
  anonymousChatRateLimiter,
  chatRateLimiter,
} from '@/lib/gemini/rate-limiter';
import { jsend } from '@/lib/jsend';
import { logger } from '@/lib/logger';
import { chatRequestSchema } from '@/schemas/chat.schema';
import { chatService } from '@/services/chat.service';
import type { ChatStreamEvent } from '@/types/chat';

function getClientIdentifier(req: Request, userId?: string): string {
  if (userId) return `user_${userId}`;
  // The client controls every X-Forwarded-For hop except the last one, which
  // our reverse proxy appended; taking the first let anyone rotate a fake IP.
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',').at(-1)!.trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export const POST = withApiPublic(async ({ req, userId }) => {
  // 1. Rate Limiting Check
  const clientId = getClientIdentifier(req, userId);
  let rateLimit = chatRateLimiter.check(clientId);
  // Anonymous callers also share one budget, so spoofed IPs can't drain the
  // Gemini quota.
  if (rateLimit.success && !userId) {
    rateLimit = anonymousChatRateLimiter.check('anonymous');
  }

  if (!rateLimit.success) {
    return jsend.fail(
      {
        message:
          'Terlalu banyak permintaan. Silakan tunggu beberapa saat lagi sebelum mengirim pertanyaan baru.',
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
      429,
    );
  }

  // 2. Parse & Validate Request Body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsend.fail({ message: 'Format JSON tidak valid' }, 400);
  }

  const input = chatRequestSchema.parse(body);

  if (req.headers.get('accept')?.includes('text/event-stream')) {
    // Resolve article permissions and DB failures before sending HTTP 200.
    const prepared = await chatService.prepareQuestion(input);
    const abort = new AbortController();
    const signal = AbortSignal.any([req.signal, abort.signal]);
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: ChatStreamEvent) => {
          if (!signal.aborted)
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
            );
        };
        try {
          controller.enqueue(encoder.encode(': connected\n\n'));
          const result = await chatService.answerQuestion(input, {
            prepared,
            signal,
            onText: (text) => send({ type: 'text', text }),
          });
          send({ type: 'done', data: result });
        } catch (error) {
          if (!signal.aborted) {
            logger.error('Chat stream failed', { error });
            send({
              type: 'error',
              message:
                error instanceof ApiError
                  ? error.message
                  : 'Gagal memproses jawaban. Silakan coba kembali.',
            });
          }
        } finally {
          if (!abort.signal.aborted) controller.close();
        }
      },
      cancel() {
        abort.abort();
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  }

  // 3. Process Chatbot Response
  const result = await chatService.answerQuestion(input, {
    signal: req.signal,
  });

  // 4. Return standard JSend response
  return jsend.success(result);
});
