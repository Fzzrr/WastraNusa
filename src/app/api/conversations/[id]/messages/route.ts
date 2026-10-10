import { withApiAuth } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { sendMessageSchema } from '@/schemas/conversation.schema';
import { conversationService } from '@/services/conversation.service';

type Params = { id: string };

// POST /api/conversations/[id]/messages — send a message in a conversation
export const POST = withApiAuth<Params>(async ({ req, userId, params }) => {
  const body = await req.json();
  const { content } = sendMessageSchema.parse(body);
  const message = await conversationService.sendMessage(
    userId,
    params.id,
    content,
  );
  return jsend.success(message, 201);
});
