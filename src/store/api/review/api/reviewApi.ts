import { baseApi } from "@/store/api/baseApi";
import type { Paginated } from "@/store/api/role/types";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type { Review, ReviewListQuery, ReviewStatusInput } from "../types";

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReviews: build.query<Paginated<Review>, ReviewListQuery | void>({
      query: (params) => ({
        url: "/reviews",
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: (data: Review[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.review],
    }),

    getReview: build.query<Review, ID>({
      query: (id) => ({ url: `/reviews/${id}`, method: "GET" }),
      providesTags: [tagTypes.review],
    }),

    updateReviewStatus: build.mutation<Review, ReviewStatusInput & { id: ID }>({
      query: ({ id, ...data }) => ({
        url: `/reviews/${id}/status`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.review, tagTypes.product],
    }),

    bulkUpdateReviewStatus: build.mutation<{ modified: number }, ReviewStatusInput & { ids: ID[] }>(
      {
        query: (data) => ({ url: "/reviews/bulk/status", method: "PATCH", data }),
        invalidatesTags: [tagTypes.review, tagTypes.product],
      },
    ),

    replyToReview: build.mutation<Review, { id: ID; text: string }>({
      query: ({ id, text }) => ({
        url: `/reviews/${id}/reply`,
        method: "PATCH",
        data: { text },
      }),
      invalidatesTags: [tagTypes.review],
    }),

    deleteReview: build.mutation<Review, ID>({
      query: (id) => ({ url: `/reviews/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.review, tagTypes.product],
    }),

    bulkDeleteReviews: build.mutation<{ deleted: number }, ID[]>({
      query: (ids) => ({
        url: "/reviews/bulk/delete",
        method: "POST",
        data: { ids },
      }),
      invalidatesTags: [tagTypes.review, tagTypes.product],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewQuery,
  useUpdateReviewStatusMutation,
  useBulkUpdateReviewStatusMutation,
  useReplyToReviewMutation,
  useDeleteReviewMutation,
  useBulkDeleteReviewsMutation,
} = reviewApi;
