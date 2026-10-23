import type { UserStatus } from "@/store/api/auth/types";
import { baseApi } from "@/store/api/baseApi";
import type { Paginated } from "@/store/api/role/types";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type {
  CreateStaffUserPayload,
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
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateStaffUserMutation,
  useUpdateStaffUserMutation,
  useSetUserStatusMutation,
  useDeleteUserMutation,
} = userApi;
