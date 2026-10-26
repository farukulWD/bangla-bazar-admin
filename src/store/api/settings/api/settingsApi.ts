import { baseApi } from "@/store/api/baseApi";
import { tagTypes } from "@/store/api/tagTypes";

import type { PublicSettings, Settings, SettingsGroup } from "../types";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicSettings: build.query<PublicSettings, void>({
      query: () => ({ url: "/settings/public", method: "GET" }),
      providesTags: [tagTypes.settings],
    }),

    getSettings: build.query<Settings, void>({
      query: () => ({ url: "/settings", method: "GET" }),
      providesTags: [tagTypes.settings],
    }),

    updateSettingsGroup: build.mutation<
      Settings[SettingsGroup],
      { group: SettingsGroup; data: Record<string, unknown> }
    >({
      query: ({ group, data }) => ({
        url: `/settings/${group}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.settings],
    }),

    resetSettingsGroup: build.mutation<Settings[SettingsGroup], SettingsGroup>({
      query: (group) => ({ url: `/settings/${group}/reset`, method: "POST" }),
      invalidatesTags: [tagTypes.settings],
    }),

    uploadSettingsAsset: build.mutation<{ url: string }, FormData>({
      query: (data) => ({ url: "/settings/upload", method: "POST", data }),
    }),
  }),
});

export const {
  useGetPublicSettingsQuery,
  useGetSettingsQuery,
  useUpdateSettingsGroupMutation,
  useResetSettingsGroupMutation,
  useUploadSettingsAssetMutation,
} = settingsApi;
