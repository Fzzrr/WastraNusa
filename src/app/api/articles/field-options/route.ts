import { withApiAdmin } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { articleService } from '@/services/article.service';

// GET /api/articles/field-options — saved values for the article form
// (label motif, topik, suku, jenis pakaian) so admins can reuse them.
export const GET = withApiAdmin(async () => {
  const options = await articleService.getFieldOptions();
  return jsend.success(options);
});
