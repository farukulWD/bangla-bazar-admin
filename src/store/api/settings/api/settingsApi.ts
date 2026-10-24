import { baseApi } from "@/store/api/baseApi";

import type { PublicSettings } from "../types";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicSettings: build.query<PublicSettings, void>({
      query: () => ({ url: "/settings/public", method: "GET" }),
    }),
  }),
});

export const { useGetPublicSettingsQuery } = settingsApi;
