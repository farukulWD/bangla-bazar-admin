import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { AxiosError, type AxiosRequestConfig } from "axios";

import type {
  ApiEnvelope,
  ApiError,
  ApiErrorEnvelope,
  ApiMeta,
  ErrorSource,
  Pagination,
} from "@/types/api";

import axiosInstance from "./axiosInstance";

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];

  contentType?: string;
  responseType?: AxiosRequestConfig["responseType"];
};

const readPagination = (
  value: ApiEnvelope<unknown>["pagination"],
): Pagination | undefined => {
  if (!value || Array.isArray(value) || typeof value !== "object")
    return undefined;
  return value;
};

const isErrorEnvelope = (value: unknown): value is ApiErrorEnvelope => {
  return typeof value === "object" && value !== null && "message" in value;
};

const readErrorBody = async (body: unknown): Promise<unknown> => {
  if (typeof Blob === "undefined" || !(body instanceof Blob)) return body;

  try {
    return JSON.parse(await body.text());
  } catch {
    return undefined;
  }
};

const normaliseError = async (error: unknown): Promise<ApiError> => {
  if (error instanceof AxiosError) {
    const body = await readErrorBody(error.response?.data);
    const status = error.response?.status;

    if (status !== undefined) {
      const message = isErrorEnvelope(body)
        ? body.message
        : `Request failed (${status})`;
      const errorSources: ErrorSource[] =
        isErrorEnvelope(body) && Array.isArray(body.errorSources)
          ? body.errorSources
          : [];
      return { status, message, errorSources };
    }

    if (
      error.code === AxiosError.ECONNABORTED ||
      error.code === AxiosError.ETIMEDOUT
    ) {
      return {
        status: "TIMEOUT_ERROR",
        message: "The server took too long to respond.",
        errorSources: [],
      };
    }

    return {
      status: "FETCH_ERROR",
      message: "Could not reach the server.",
      errorSources: [],
    };
  }

  return {
    status: "CUSTOM_ERROR",
    message: "Something went wrong.",
    errorSources: [],
  };
};

export const axiosBaseQuery: BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  ApiError,
  object,
  ApiMeta
> = async ({
  url,
  method = "GET",
  data,
  params,
  headers,
  contentType,
  responseType,
}) => {
  try {
    const response = await axiosInstance({
      url,
      method,
      data: method === "GET" ? undefined : data,
      params,
      responseType,
      headers: {
        ...headers,
        ...(data instanceof FormData
          ? {}
          : { "Content-Type": contentType ?? "application/json" }),
      },
    });

    if (responseType === "blob") {
      return { data: response.data, meta: { pagination: undefined } };
    }

    const envelope = response.data as ApiEnvelope<unknown> | undefined;

    return {
      data: envelope?.data,
      meta: { pagination: readPagination(envelope?.pagination) },
    };
  } catch (error) {
    return { error: await normaliseError(error) };
  }
};
