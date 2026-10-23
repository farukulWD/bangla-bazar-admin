const DEFAULT_API_URL = "http://localhost:5055/api/v1";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_URL;

export const API_ORIGIN = new URL(API_BASE_URL).origin;
