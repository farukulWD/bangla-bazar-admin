import { UserType, type UserStatus } from "@/store/api/auth/types";
import { baseApi } from "@/store/api/baseApi";
import type { BulkResult } from "@/store/api/category/types";
import type { Paginated } from "@/store/api/role/types";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type {
  CreateStaffUserPayload,
  Customer,
  CustomerFilterQuery,
  CustomerListQuery,
  CustomerSummary,
  StaffUser,
  UpdateStaffUserPayload,
  UserListQuery,
} from "../types";

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<Paginated<StaffUser>, UserListQuery>({
      query: (params) => ({ url: "/users", method: "GET", params }),
      transformResponse: (data: StaffUser[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.user],
    }),

    getUser: build.query<StaffUser, ID>({
      query: (id) => ({ url: `/users/${id}`, method: "GET" }),
      providesTags: [tagTypes.user],
    }),

    createStaffUser: build.mutation<StaffUser, CreateStaffUserPayload>({
      query: (data) => ({ url: "/users", method: "POST", data }),
      invalidatesTags: [tagTypes.user],
    }),

    updateStaffUser: build.mutation<
      StaffUser,
      { id: ID; data: UpdateStaffUserPayload }
    >({
      query: ({ id, data }) => ({ url: `/users/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.user],
    }),

    setUserStatus: build.mutation<StaffUser, { id: ID; status: UserStatus }>({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [tagTypes.user],
    }),

    deleteUser: build.mutation<StaffUser, ID>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.user],
    }),

    getCustomers: build.query<Paginated<Customer>, CustomerListQuery>({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params: { ...params, userType: UserType.Customer },
      }),
      transformResponse: (data: Customer[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.user],
    }),

    getCustomerSummary: build.query<CustomerSummary, ID>({
      query: (id) => ({ url: `/users/${id}/customer-summary`, method: "GET" }),
      providesTags: [tagTypes.user],
    }),

    bulkSetCustomerStatus: build.mutation<
      BulkResult,
      { ids: ID[]; status: UserStatus }
    >({
      query: (data) => ({
        url: "/users/customers/bulk/status",
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.user],
    }),

    bulkDeleteCustomers: build.mutation<BulkResult, ID[]>({
      query: (ids) => ({
        url: "/users/customers/bulk/delete",
        method: "PATCH",
        data: { ids },
      }),
      invalidatesTags: [tagTypes.user],
    }),

    exportCustomers: build.mutation<Blob, CustomerFilterQuery>({
      query: (params) => ({
        url: "/users/customers/export",
        method: "GET",
        params,
        responseType: "blob",
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateStaffUserMutation,
  useUpdateStaffUserMutation,
  useSetUserStatusMutation,
  useDeleteUserMutation,
  useGetCustomersQuery,
  useGetCustomerSummaryQuery,
  useBulkSetCustomerStatusMutation,
  useBulkDeleteCustomersMutation,
  useExportCustomersMutation,
} = userApi;
