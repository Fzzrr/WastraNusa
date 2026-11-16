import { withApiAdmin, withApiPublic } from '@/lib/api-handler';
import { isAdmin } from '@/lib/auth/roles';
import { jsend } from '@/lib/jsend';
import { updateArticleSchema } from '@/schemas/article.schema';
import { articleService } from '@/services/article.service';

export const GET = withApiPublic<{ id: string }>(
  async ({ params, userId, userRole }) => {
    const article = await articleService.getArticleDetail(
      params.id,
      userId,
      isAdmin(userRole),
    );
    return jsend.success(article);
  },
);

export const PUT = withApiAdmin<{ id: string }>(async ({ req, params }) => {
  const body = await req.json();
  const data = updateArticleSchema.parse(body);
  const article = await articleService.updateArticle(params.id, data);
  return jsend.success(article);
});

export const DELETE = withApiAdmin<{ id: string }>(async ({ params }) => {
  await articleService.deleteArticle(params.id);
  return jsend.success(null);
});
