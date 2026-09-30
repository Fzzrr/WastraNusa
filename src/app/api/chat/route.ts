import { withApiPublic } from '@/lib/api-handler';
import { chatRateLimiter } from '@/lib/gemini/rate-limiter';
import { jsend } from '@/lib/jsend';
import { chatRequestSchema } from '@/schemas/chat.schema';
import { chatService } from '@/services/chat.service';

function getClientIdentifier(req: Request, userId?: string): string {
  if (userId) return `user_${userId}`;
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export const POST = withApiPublic(async ({ req, userId }) => {
  // 1. Rate Limiting Check
  const clientId = getClientIdentifier(req, userId);
  const rateLimit = chatRateLimiter.check(clientId);

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

  // 3. Process Chatbot Response
  const result = await chatService.answerQuestion(input);

  // 4. Return standard JSend response
  return jsend.success(result);
});
