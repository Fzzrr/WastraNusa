import { withApiAuth } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { conversationService } from '@/services/conversation.service';

type Params = { id: string };

// GET /api/conversations/[id] — load a conversation's detail (marks read)
export const GET = withApiAuth<Params>(async ({ userId, params }) => {
  const conversation = await conversationService.getConversation(
    userId,
    params.id,
  );
  return jsend.success(conversation);
});
