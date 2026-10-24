import type { ID, ISODate } from "@/types/api";

export type CategoryStatus = "show" | "hide";

export type Category = {
  _id: ID;
  name: string;
  description?: string;
  slug: string;
  parentId: ID | null;
  parentName?: string;
  icon?: string;
  status: CategoryStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type CategoryNode = Omit<Category, "createdAt" | "updatedAt"> & {
  children: CategoryNode[];
};

export type CategoryPayload = {
  name?: string;
  description?: string;
  slug?: string;
  parentId?: ID | null;
  icon?: string;
  status?: CategoryStatus;
};

export type CategoryListQuery = {
  searchTerm?: string;
  status?: CategoryStatus;
  page?: number;
  limit?: number;
  sort?: string;
};

export type BulkResult = {
  succeeded: number;
  failed: { index: number; identifier?: string; error: string }[];
};

export type CategoryBulkUpdatePayload = {
  ids: ID[];
  status?: CategoryStatus;
  parentId?: ID | null;
};
