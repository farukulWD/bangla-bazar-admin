import type { BulkResult } from "@/store/api/category/types";
import type { ID, ISODate } from "@/types/api";

export type ProductStatus = "show" | "hide";
export type ImageStatus = "ready" | "processing" | "failed";

export type ProductPrices = {
  originalPrice: number;
  price: number;
  discount: number;
};

export type VariantOption = {
  attributeId: ID;
  valueId: ID;
};

export type ProductVariant = {
  _id: ID;
  options: VariantOption[];
  sku?: string;
  barcode?: string;
  originalPrice: number;
  price: number;
  discount: number;
  stock: number;
  image?: string;
};

export type ProductCategoryRef = {
  _id: ID;
  name: string;
  slug: string;
};

export type Product = {
  _id: ID;
  title: string;
  description?: string;
  slug: string;
  sku?: string;
  barcode?: string;
  category: ProductCategoryRef | ID;
  categories: ID[];
  images: string[];
  imageStatus: ImageStatus;
  tags: string[];
  prices: ProductPrices;
  stock: number;
  sales: number;
  isCombination: boolean;
  variants: ProductVariant[];
  status: ProductStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type ProductVariantPayload = {
  _id?: ID;
  options: VariantOption[];
  sku?: string;
  barcode?: string;
  originalPrice: number;
  price: number;
  stock?: number;
  image?: string;
};

export type ProductPayload = {
  title: string;
  description?: string;
  slug?: string;
  sku?: string;
  barcode?: string;
  category: ID;
  categories?: ID[];
  images?: string[];
  tags?: string[];
  prices: { originalPrice: number; price: number };
  stock?: number;
  variants?: ProductVariantPayload[];
  status?: ProductStatus;
};

export type ProductListQuery = {
  searchTerm?: string;
  category?: ID;
  status?: ProductStatus;
  inStock?: boolean;
  discounted?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
};

export type ProductBulkUpdatePayload = {
  ids: ID[];
  status?: ProductStatus;
  category?: ID;
};

export type ProductExportFilter = {
  status?: ProductStatus;
  category?: ID;
};

export type JobState =
  | "waiting"
  | "active"
  | "delayed"
  | "prioritized"
  | "waiting-children"
  | "completed"
  | "failed"
  | "unknown";

export type ProductJob<T> = {
  id: string;
  name: string;
  state: JobState;
  result: T | null;
  failedReason?: string;
};

export type ImportJobResult = BulkResult;

export type ExportJobResult = {
  count: number;
  url: string;
};
