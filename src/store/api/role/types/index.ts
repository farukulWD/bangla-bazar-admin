import type { ID, ISODate, Pagination } from "@/types/api";

export type PermissionMap = Record<string, boolean>;

export type RoleModule = {
  module: string;
  permissions: PermissionMap;
};

export type Role = {
  _id: ID;
  name: string;
  description?: string;
  modules: RoleModule[];
  isActive: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type PermissionCatalogueModule = {
  module: string;
  label: string;
  permissions: { key: string; label: string }[];
};

export type RolePayload = {
  name: string;
  description?: string;
  modules: RoleModule[];
  isActive?: boolean;
};

export type RoleListQuery = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

export type Paginated<T> = {
  data: T[];
  pagination?: Pagination;
};
