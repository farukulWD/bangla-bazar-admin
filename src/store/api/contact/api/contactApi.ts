import { baseApi } from "@/store/api/baseApi";
import type { Paginated } from "@/store/api/role/types";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type { Contact, ContactListQuery, ContactStatus } from "../types";

export const contactApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getContacts: build.query<Paginated<Contact>, ContactListQuery | void>({
      query: (params) => ({ url: "/contacts", method: "GET", params: params ?? {} }),
      transformResponse: (data: Contact[], meta: ApiMeta | undefined) => ({
        data,
        pagination: meta?.pagination,
      }),
      providesTags: [tagTypes.contact],
    }),

    getContact: build.query<Contact, ID>({
      query: (id) => ({ url: `/contacts/${id}`, method: "GET" }),
      providesTags: [tagTypes.contact],
    }),

    updateContactStatus: build.mutation<Contact, { id: ID; status: ContactStatus }>({
      query: ({ id, status }) => ({
        url: `/contacts/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [tagTypes.contact],
    }),

    deleteContact: build.mutation<Contact, ID>({
      query: (id) => ({ url: `/contacts/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.contact],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactQuery,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
} = contactApi;
