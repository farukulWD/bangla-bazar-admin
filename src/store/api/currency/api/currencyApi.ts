import { baseApi } from "@/store/api/baseApi";
import type { Paginated } from "@/store/api/role/types";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type {
  Currency,
  CurrencyListQuery,
  CurrencyPayload,
  CurrencyStatus,
} from "../types";

export const currencyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCurrencies: build.query<Paginated<Currency>, CurrencyListQuery | void>({
      query: (params) => ({ url: "/currencies", method: "GET", params: params ?? {} }),
      transformResponse: (data: Currency[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.currency],
    }),

    getCurrency: build.query<Currency, ID>({
      query: (id) => ({ url: `/currencies/${id}`, method: "GET" }),
      providesTags: [tagTypes.currency],
    }),

    createCurrency: build.mutation<Currency, CurrencyPayload>({
      query: (data) => ({ url: "/currencies", method: "POST", data }),
      invalidatesTags: [tagTypes.currency],
    }),

    updateCurrency: build.mutation<Currency, { id: ID; data: CurrencyPayload }>({
      query: ({ id, data }) => ({ url: `/currencies/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.currency, tagTypes.settings],
    }),

    setCurrencyRate: build.mutation<Currency, { id: ID; rate: number }>({
      query: ({ id, rate }) => ({
        url: `/currencies/${id}/rate`,
        method: "PATCH",
        data: { rate },
      }),
      invalidatesTags: [tagTypes.currency],
    }),

    setCurrencyStatus: build.mutation<Currency, { id: ID; status: CurrencyStatus }>({
      query: ({ id, status }) => ({
        url: `/currencies/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [tagTypes.currency],
    }),

    setBaseCurrency: build.mutation<Currency, ID>({
      query: (id) => ({ url: `/currencies/${id}/base`, method: "PATCH" }),
      invalidatesTags: [tagTypes.currency, tagTypes.settings],
    }),

    deleteCurrency: build.mutation<unknown, ID>({
      query: (id) => ({ url: `/currencies/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.currency],
    }),
  }),
});

export const {
  useGetCurrenciesQuery,
  useGetCurrencyQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useSetCurrencyRateMutation,
  useSetCurrencyStatusMutation,
  useSetBaseCurrencyMutation,
  useDeleteCurrencyMutation,
} = currencyApi;
