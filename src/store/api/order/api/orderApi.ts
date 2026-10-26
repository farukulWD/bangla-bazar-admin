import { baseApi } from "@/store/api/baseApi";
import type { Paginated } from "@/store/api/role/types";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type {
  Order,
  OrderFilterQuery,
  OrderListQuery,
  OrderStats,
  OrderStatus,
  PaymentStatus,
} from "../types";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<Paginated<Order>, OrderListQuery | void>({
      query: (params) => ({ url: "/orders", method: "GET", params: params ?? {} }),
      transformResponse: (data: Order[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.order],
    }),

    getOrderStats: build.query<OrderStats, void>({
      query: () => ({ url: "/orders/stats", method: "GET" }),
      providesTags: [tagTypes.order],
    }),

    getOrder: build.query<Order, ID>({
      query: (id) => ({ url: `/orders/${id}`, method: "GET" }),
      providesTags: [tagTypes.order],
    }),

    updateOrderStatus: build.mutation<Order, { id: ID; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [tagTypes.order],
    }),

    updatePaymentStatus: build.mutation<
      Order,
      { id: ID; paymentStatus: PaymentStatus }
    >({
      query: ({ id, paymentStatus }) => ({
        url: `/orders/${id}/payment`,
        method: "PATCH",
        data: { paymentStatus },
      }),
      invalidatesTags: [tagTypes.order],
    }),

    cancelOrder: build.mutation<Order, ID>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: "POST" }),
      invalidatesTags: [tagTypes.order],
    }),

    exportOrders: build.mutation<Blob, OrderFilterQuery>({
      query: (params) => ({
        url: "/orders/export",
        method: "GET",
        params,
        responseType: "blob",
      }),
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderStatsQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useCancelOrderMutation,
  useExportOrdersMutation,
} = orderApi;
