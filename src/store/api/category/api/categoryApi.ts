import { baseApi } from "@/store/api/baseApi";
import type { Paginated } from "@/store/api/role/types";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type {
  BulkResult,
  Category,
  CategoryBulkUpdatePayload,
  CategoryListQuery,
  CategoryNode,
  CategoryPayload,
  CategoryStatus,
} from "../types";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<Paginated<Category>, CategoryListQuery | void>({
      query: (params) => ({ url: "/category", method: "GET", params: params ?? {} }),
      transformResponse: (data: Category[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.category],
    }),

    getCategoryTree: build.query<CategoryNode[], void>({
      query: () => ({ url: "/category/tree", method: "GET" }),
      providesTags: [tagTypes.category],
    }),

    getCategory: build.query<Category, ID>({
      query: (id) => ({ url: `/category/${id}`, method: "GET" }),
      providesTags: [tagTypes.category],
    }),

    createCategory: build.mutation<Category, FormData>({
      query: (data) => ({ url: "/category", method: "POST", data }),
      invalidatesTags: [tagTypes.category],
    }),

    updateCategory: build.mutation<Category, { id: ID; data: FormData }>({
      query: ({ id, data }) => ({ url: `/category/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.category],
    }),

    setCategoryStatus: build.mutation<Category, { id: ID; status: CategoryStatus }>({
      query: ({ id, status }) => ({
        url: `/category/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [tagTypes.category],
    }),

    deleteCategory: build.mutation<{ deleted: number }, ID>({
      query: (id) => ({ url: `/category/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.category],
    }),

    bulkCreateCategories: build.mutation<BulkResult, CategoryPayload[]>({
      query: (categories) => ({
        url: "/category/bulk",
        method: "POST",
        data: { categories },
      }),
      invalidatesTags: [tagTypes.category],
    }),

    bulkUpdateCategories: build.mutation<BulkResult, CategoryBulkUpdatePayload>({
      query: (data) => ({ url: "/category/bulk/update", method: "PATCH", data }),
      invalidatesTags: [tagTypes.category],
    }),

    bulkDeleteCategories: build.mutation<BulkResult, ID[]>({
      query: (ids) => ({
        url: "/category/bulk/delete",
        method: "PATCH",
        data: { ids },
      }),
      invalidatesTags: [tagTypes.category],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useSetCategoryStatusMutation,
  useDeleteCategoryMutation,
  useBulkCreateCategoriesMutation,
  useBulkUpdateCategoriesMutation,
  useBulkDeleteCategoriesMutation,
} = categoryApi;
