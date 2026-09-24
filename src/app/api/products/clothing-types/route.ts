import { withApiPublic } from '@/lib/api-handler';
import { jsend } from '@/lib/jsend';
import { productService } from '@/services/product.service';

export const GET = withApiPublic(async () => {
  const clothingTypes = await productService.getClothingTypes();
  return jsend.success(clothingTypes);
});
