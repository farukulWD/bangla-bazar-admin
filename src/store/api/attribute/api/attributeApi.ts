import { baseApi } from "@/store/api/baseApi";
import type { BulkResult } from "@/store/api/category/types";
import type { Paginated } from "@/store/api/role/types";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type {
  Attribute,
  AttributeBulkUpdatePayload,
  AttributeListQuery,
  AttributePayload,
  AttributeStatus,
  AttributeValuePayload,
} from "../types";

export const attributeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAttributes: build.query<Paginated<Attribute>, AttributeListQuery | void>({
      query: (params) => ({ url: "/attributes", method: "GET", params: params ?? {} }),
      transformResponse: (data: Attribute[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.attribute],
    }),

    getAttribute: build.query<Attribute, ID>({
      query: (id) => ({ url: `/attributes/${id}`, method: "GET" }),
      providesTags: [tagTypes.attribute],
    }),

    createAttribute: build.mutation<Attribute, AttributePayload>({
      query: (data) => ({ url: "/attributes", method: "POST", data }),
      invalidatesTags: [tagTypes.attribute],
    }),

    updateAttribute: build.mutation<
      Attribute,
      { id: ID; data: Partial<Omit<AttributePayload, "values">> }
    >({
      query: ({ id, data }) => ({ url: `/attributes/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.attribute],
    }),

    setAttributeStatus: build.mutation<Attribute, { id: ID; status: AttributeStatus }>({
      query: ({ id, status }) => ({
        url: `/attributes/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    deleteAttribute: build.mutation<unknown, ID>({
      query: (id) => ({ url: `/attributes/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.attribute],
    }),

    addAttributeValue: build.mutation<Attribute, { id: ID; data: AttributeValuePayload }>({
      query: ({ id, data }) => ({
        url: `/attributes/${id}/values`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    updateAttributeValue: build.mutation<
      Attribute,
      { id: ID; valueId: ID; data: Partial<AttributeValuePayload> }
    >({
      query: ({ id, valueId, data }) => ({
        url: `/attributes/${id}/values/${valueId}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    setAttributeValueStatus: build.mutation<
      Attribute,
      { id: ID; valueId: ID; status: AttributeStatus }
    >({
      query: ({ id, valueId, status }) => ({
        url: `/attributes/${id}/values/${valueId}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    deleteAttributeValue: build.mutation<Attribute, { id: ID; valueId: ID }>({
      query: ({ id, valueId }) => ({
        url: `/attributes/${id}/values/${valueId}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    bulkDeleteAttributeValues: build.mutation<BulkResult, { id: ID; valueIds: ID[] }>({
      query: ({ id, valueIds }) => ({
        url: `/attributes/${id}/values/bulk/delete`,
        method: "PATCH",
        data: { valueIds },
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    bulkCreateAttributes: build.mutation<BulkResult, AttributePayload[]>({
      query: (attributes) => ({
        url: "/attributes/bulk",
        method: "POST",
        data: { attributes },
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    bulkUpdateAttributes: build.mutation<BulkResult, AttributeBulkUpdatePayload>({
      query: (data) => ({ url: "/attributes/bulk/update", method: "PATCH", data }),
      invalidatesTags: [tagTypes.attribute],
    }),

    bulkDeleteAttributes: build.mutation<BulkResult, ID[]>({
      query: (ids) => ({
        url: "/attributes/bulk/delete",
        method: "PATCH",
        data: { ids },
      }),
      invalidatesTags: [tagTypes.attribute],
    }),
  }),
});

export const {
  useGetAttributesQuery,
  useGetAttributeQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useSetAttributeStatusMutation,
  useDeleteAttributeMutation,
  useAddAttributeValueMutation,
  useUpdateAttributeValueMutation,
  useSetAttributeValueStatusMutation,
  useDeleteAttributeValueMutation,
  useBulkDeleteAttributeValuesMutation,
  useBulkCreateAttributesMutation,
  useBulkUpdateAttributesMutation,
  useBulkDeleteAttributesMutation,
} = attributeApi;
