import { baseApi } from "@/store/api/baseApi";
import type { Paginated } from "@/store/api/role/types";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type {
  ExportJobResult,
  ImportJobResult,
  Product,
  ProductBulkUpdatePayload,
  ProductExportFilter,
  ProductJob,
  ProductListQuery,
  ProductStatus,
} from "../types";

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<Paginated<Product>, ProductListQuery | void>({
      query: (params) => ({ url: "/products", method: "GET", params: params ?? {} }),
      transformResponse: (data: Product[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.product],
    }),

    getProduct: build.query<Product, ID>({
      query: (id) => ({ url: `/products/${id}`, method: "GET" }),
      providesTags: [tagTypes.product],
    }),

    createProduct: build.mutation<Product, FormData>({
      query: (data) => ({ url: "/products", method: "POST", data }),
      invalidatesTags: [tagTypes.product],
    }),

    updateProduct: build.mutation<Product, { id: ID; data: FormData }>({
      query: ({ id, data }) => ({ url: `/products/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.product],
    }),

    setProductStatus: build.mutation<Product, { id: ID; status: ProductStatus }>({
      query: ({ id, status }) => ({
        url: `/products/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [tagTypes.product],
    }),

    deleteProduct: build.mutation<{ deleted: number }, ID>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.product],
    }),

    bulkUpdateProducts: build.mutation<{ updated: number }, ProductBulkUpdatePayload>({
      query: (data) => ({ url: "/products/bulk/update", method: "PATCH", data }),
      invalidatesTags: [tagTypes.product],
    }),

    bulkDeleteProducts: build.mutation<{ deleted: number }, ID[]>({
      query: (ids) => ({
        url: "/products/bulk/delete",
        method: "PATCH",
        data: { ids },
      }),
      invalidatesTags: [tagTypes.product],
    }),

    bulkCreateProducts: build.mutation<{ jobId: string }, unknown[]>({
      query: (products) => ({
        url: "/products/bulk",
        method: "POST",
        data: { products },
      }),
    }),

    exportProducts: build.mutation<{ jobId: string }, ProductExportFilter>({
      query: (data) => ({ url: "/products/bulk/export", method: "POST", data }),
    }),

    getProductJob: build.query<
      ProductJob<ImportJobResult | ExportJobResult>,
      string
    >({
      query: (jobId) => ({ url: `/products/bulk/jobs/${jobId}`, method: "GET" }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useSetProductStatusMutation,
  useDeleteProductMutation,
  useBulkUpdateProductsMutation,
  useBulkDeleteProductsMutation,
  useBulkCreateProductsMutation,
  useExportProductsMutation,
  useGetProductJobQuery,
  useLazyGetProductJobQuery,
} = productApi;
