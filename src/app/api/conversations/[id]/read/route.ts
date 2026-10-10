import { withApiAuth } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { conversationService } from '@/services/conversation.service';

type Params = { id: string };

// POST /api/conversations/[id]/read — mark the other side's messages as read
export const POST = withApiAuth<Params>(async ({ userId, params }) => {
  const result = await conversationService.markRead(userId, params.id);
  return jsend.success(result);
});
