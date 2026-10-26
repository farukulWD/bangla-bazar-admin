import { baseApi } from "@/store/api/baseApi";
import type { Paginated } from "@/store/api/role/types";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type { Payment, PaymentListQuery } from "../types";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPayments: build.query<Paginated<Payment>, PaymentListQuery | void>({
      query: (params) => ({ url: "/payments", method: "GET", params: params ?? {} }),
      transformResponse: (data: Payment[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.payment],
    }),

    getPayment: build.query<Payment, ID>({
      query: (id) => ({ url: `/payments/${id}`, method: "GET" }),
      providesTags: [tagTypes.payment],
    }),
  }),
});

export const { useGetPaymentsQuery, useGetPaymentQuery } = paymentApi;
