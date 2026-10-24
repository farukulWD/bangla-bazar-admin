export type ID = string;

export type ISODate = string;

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type ApiEnvelope<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;

  pagination?: Pagination | [] | null;
};

export type ErrorSource = {
  path: string | number;
  message: string;
};

export type ApiErrorEnvelope = {
  statusCode: number;
  success: false;
  message: string;
  errorSources?: ErrorSource[];
  stack?: string | null;
};

export type ApiError = {
  status: number | "FETCH_ERROR" | "PARSING_ERROR" | "TIMEOUT_ERROR" | "CUSTOM_ERROR";
  message: string;
  errorSources: ErrorSource[];
};

export type ApiMeta = {
  pagination?: Pagination;
};
