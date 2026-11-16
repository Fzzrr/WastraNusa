import { withApiPublic } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { articleService } from '@/services/article.service';

// POST /api/articles/[id]/view — count one view, sent by the article page.
export const POST = withApiPublic<{ id: string }>(async ({ params }) => {
  await articleService.recordView(params.id);
  return jsend.success(null);
});
