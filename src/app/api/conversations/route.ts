import { withApiAuth } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { startConversationSchema } from '@/schemas/conversation.schema';
import { conversationService } from '@/services/conversation.service';

// GET /api/conversations — list the authenticated user's conversations
export const GET = withApiAuth(async ({ userId }) => {
  const conversations = await conversationService.getMyConversations(userId);
  return jsend.success(conversations);
});

// POST /api/conversations — start (or reuse) a conversation with another user
export const POST = withApiAuth(async ({ req, userId }) => {
  const body = await req.json();
  const data = startConversationSchema.parse(body);
  const conversation = await conversationService.startConversation(
    userId,
    data.otherUserId,
  );
  return jsend.success(conversation, 201);
});
