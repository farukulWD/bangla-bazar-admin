import type { ApiError, ErrorSource } from "@/types/api";

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error &&
    "errorSources" in error
  );
};

export const getErrorMessage = (error: unknown, fallback = "Something went wrong."): string => {
  return isApiError(error) ? error.message : fallback;
};

export const getFieldErrors = (error: unknown): ErrorSource[] => {
  return isApiError(error) ? error.errorSources : [];
};

export const getErrorStatus = (error: unknown): ApiError["status"] | null => {
  return isApiError(error) ? error.status : null;
};
