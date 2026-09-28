'use client';

import {
  ProductFormModal,
  type ProductFormModalProps,
} from '@/components/product-inventory/product-form-modal';
import {
  useArticleOptions,
  useClothingTypeOptions,
  useCreateSellerProduct,
  useUpdateSellerProduct,
} from '@/hooks/use-seller-product';

const HOOKS = {
  useCreate: useCreateSellerProduct,
  useUpdate: useUpdateSellerProduct,
  useArticleOptions,
  useClothingTypeOptions,
};

export default function AddUpdateProductModal(props: ProductFormModalProps) {
  return <ProductFormModal {...props} hooks={HOOKS} />;
}
