import { baseApi } from "@/store/api/baseApi";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type {
  Paginated,
  PermissionCatalogueModule,
  Role,
  RoleListQuery,
  RolePayload,
} from "../types";

export const roleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPermissionCatalogue: build.query<PermissionCatalogueModule[], void>({
      query: () => ({ url: "/roles/permissions", method: "GET" }),
    }),

    getRoles: build.query<Paginated<Role>, RoleListQuery | void>({
      query: (params) => ({ url: "/roles", method: "GET", params: params ?? {} }),
      transformResponse: (data: Role[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.role],
    }),

    getRole: build.query<Role, ID>({
      query: (id) => ({ url: `/roles/${id}`, method: "GET" }),
      providesTags: [tagTypes.role],
    }),

    createRole: build.mutation<Role, RolePayload>({
      query: (data) => ({ url: "/roles", method: "POST", data }),
      invalidatesTags: [tagTypes.role],
    }),

    updateRole: build.mutation<Role, { id: ID; data: RolePayload }>({
      query: ({ id, data }) => ({ url: `/roles/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.role, tagTypes.user, tagTypes.session],
    }),

    deleteRole: build.mutation<Role, ID>({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.role],
    }),
  }),
});

export const {
  useGetPermissionCatalogueQuery,
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;
