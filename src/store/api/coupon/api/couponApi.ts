import { baseApi } from "@/store/api/baseApi";
import type { BulkResult } from "@/store/api/category/types";
import type { Paginated } from "@/store/api/role/types";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type {
  Coupon,
  CouponBulkUpdatePayload,
  CouponListQuery,
  CouponPayload,
  CouponStatus,
} from "../types";

export const couponApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCoupons: build.query<Paginated<Coupon>, CouponListQuery | void>({
      query: (params) => ({ url: "/coupons", method: "GET", params: params ?? {} }),
      transformResponse: (data: Coupon[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.coupon],
    }),

    getCoupon: build.query<Coupon, ID>({
      query: (id) => ({ url: `/coupons/${id}`, method: "GET" }),
      providesTags: [tagTypes.coupon],
    }),

    createCoupon: build.mutation<Coupon, FormData>({
      query: (data) => ({ url: "/coupons", method: "POST", data }),
      invalidatesTags: [tagTypes.coupon],
    }),

    updateCoupon: build.mutation<Coupon, { id: ID; data: FormData }>({
      query: ({ id, data }) => ({ url: `/coupons/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.coupon],
    }),

    setCouponStatus: build.mutation<Coupon, { id: ID; status: CouponStatus }>({
      query: ({ id, status }) => ({
        url: `/coupons/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [tagTypes.coupon],
    }),

    deleteCoupon: build.mutation<unknown, ID>({
      query: (id) => ({ url: `/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.coupon],
    }),

    bulkCreateCoupons: build.mutation<BulkResult, CouponPayload[]>({
      query: (coupons) => ({ url: "/coupons/bulk", method: "POST", data: { coupons } }),
      invalidatesTags: [tagTypes.coupon],
    }),

    bulkUpdateCoupons: build.mutation<BulkResult, CouponBulkUpdatePayload>({
      query: (data) => ({ url: "/coupons/bulk/update", method: "PATCH", data }),
      invalidatesTags: [tagTypes.coupon],
    }),

    bulkDeleteCoupons: build.mutation<BulkResult, ID[]>({
      query: (ids) => ({ url: "/coupons/bulk/delete", method: "PATCH", data: { ids } }),
      invalidatesTags: [tagTypes.coupon],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useSetCouponStatusMutation,
  useDeleteCouponMutation,
  useBulkCreateCouponsMutation,
  useBulkUpdateCouponsMutation,
  useBulkDeleteCouponsMutation,
} = couponApi;
