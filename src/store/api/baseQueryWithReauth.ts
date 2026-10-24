import type { BaseQueryFn } from "@reduxjs/toolkit/query";

import type { ApiEnvelope, ApiError, ApiMeta } from "@/types/api";

import { axiosBaseQuery, type AxiosBaseQueryArgs } from "./axiosBaseQuery";
import axiosInstance from "./axiosInstance";
import { clearAuthToken, setAuthToken } from "./token";

const NO_REAUTH_PATHS = [
  "/auth/login",
  "/auth/refresh-token",
  "/auth/logout",
];

let refreshInFlight: Promise<string | null> | null = null;

export const refreshAccessToken = async (): Promise<string | null> => {
  refreshInFlight ??= (async () => {
    try {
      const response = await axiosInstance.post("/auth/refresh-token");
      const token = (
        response.data as ApiEnvelope<{ token: string }> | undefined
      )?.data?.token;

      if (!token) return null;

      setAuthToken(token);
      return token;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
};

export const baseQueryWithReauth: BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  ApiError,
  object,
  ApiMeta
> = async (args, api, extraOptions) => {
  const result = await axiosBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) return result;
  if (NO_REAUTH_PATHS.some((path) => args.url.startsWith(path))) return result;

  const token = await refreshAccessToken();

  if (!token) {
    clearAuthToken();
    return result;
  }

  return axiosBaseQuery(args, api, extraOptions);
};
