import { withApiAuth } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { getPagination } from '@/lib/pagination';
import { articleService } from '@/services/article.service';

export const GET = withApiAuth(async ({ req, userId }) => {
  const { page, limit } = getPagination(req, 5);
  const articles = await articleService.getLikedArticles(userId, page, limit);
  return jsend.success(articles);
});
