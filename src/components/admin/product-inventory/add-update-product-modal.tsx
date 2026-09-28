'use client';

import {
  ProductFormModal,
  type ProductFormModalProps,
} from '@/components/product-inventory/product-form-modal';
import {
  useArticleOptions,
  useClothingTypeOptions,
  useCreateProductInventory,
  useUpdateProductInventory,
} from '@/hooks/use-product-inventory';

const HOOKS = {
  useCreate: useCreateProductInventory,
  useUpdate: useUpdateProductInventory,
  useArticleOptions,
  useClothingTypeOptions,
};

export default function AddUpdateProductModal(props: ProductFormModalProps) {
  return <ProductFormModal {...props} hooks={HOOKS} />;
}
