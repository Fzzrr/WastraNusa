import { Gender, ProductStatus, VariantType } from '@/generated/prisma/enums';

export interface ProductVariantItem {
  id: string;
  name: string;
  type: VariantType;
  price: number | null;
  stock: number;
  sku: string;
  imageURL?: string | null;
}

export interface ProductInventoryItem {
  id: string;
  articleId: string;
  articleTitle: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  stock: number;
  sku: string;
  weight: number;
  imageURL?: string | null;
  island: string;
  province: string;
  clothingType: string;
  gender: Gender | null;
  status: ProductStatus;
  sold: number;
  variants: ProductVariantItem[];
  variantCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductCatalogSortBy =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc';

export interface ProductCatalogFilters {
  minPrice?: number;
  maxPrice?: number;
  island?: string;
  size?: string;
  clothingType?: string;
  gender?: Gender;
  status?: ProductStatus;
  inStock?: boolean;
  excludeOutOfStock?: boolean;
  sortBy?: ProductCatalogSortBy;
  topic?: string;
}

export interface ProductFilterOption {
  name: string;
  count: number;
  active?: boolean;
}

export interface ProductInventoryListMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  categories?: ProductFilterOption[];
  islands?: ProductFilterOption[];
  sizes?: ProductFilterOption[];
  genders?: ProductFilterOption[];
  statuses?: ProductFilterOption[];
  priceRange?: {
    min: number;
    max: number;
  };
  stats?: {
    totalProducts: number;
    totalCategories: number;
    totalIslands: number;
  };
}

export interface ProductInventoryListResponse {
  items: ProductInventoryItem[];
  meta: ProductInventoryListMeta;
}

export interface ArticleOptionItem {
  id: string;
  title: string;
  island: string;
  province: string;
}
