import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

import {
  getErrorMessage,
  getErrorStatus,
  getFieldErrors,
} from "@/lib/api-error";

export type ServerErrorOutcome = {
  formMessage: string | null;
  retryAfterSeconds: number | null;
};

const GENERIC_MESSAGES = new Set([
  "Data validation error",
  "Something went wrong",
]);

const RETRY_AFTER_PATH = "retryAfterSeconds";

export const applyServerErrors = <T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  knownFields: readonly FieldPath<T>[],
): ServerErrorOutcome => {
  const message = getErrorMessage(error);

  if (typeof getErrorStatus(error) !== "number") {
    return { formMessage: message, retryAfterSeconds: null };
  }

  const fields = new Set<string>(knownFields);
  const matched: { path: FieldPath<T>; message: string }[] = [];
  let retryAfterSeconds: number | null = null;
  let hasUnmatched = false;

  for (const source of getFieldErrors(error)) {
    const path = String(source.path);

    if (path === RETRY_AFTER_PATH) {
      const seconds = Number(source.message);
      if (Number.isFinite(seconds)) retryAfterSeconds = seconds;
      continue;
    }

    if (path === "") {
      hasUnmatched = true;
      continue;
    }

    if (fields.has(path)) {
      matched.push({ path: path as FieldPath<T>, message: source.message });
      continue;
    }

    hasUnmatched = true;
  }

  if (matched.length === 0) {
    return { formMessage: message, retryAfterSeconds };
  }

  if (matched.length === 1 && !hasUnmatched && !GENERIC_MESSAGES.has(message)) {
    setError(matched[0].path, { type: "server", message });
    return { formMessage: null, retryAfterSeconds };
  }

  for (const field of matched) {
    setError(field.path, { type: "server", message: field.message });
  }

  return {
    formMessage: hasUnmatched ? message : null,
    retryAfterSeconds,
  };
};

export const getRetryAfterSeconds = (error: unknown): number | null => {
  for (const source of getFieldErrors(error)) {
    if (String(source.path) !== RETRY_AFTER_PATH) continue;

    const seconds = Number(source.message);
    if (Number.isFinite(seconds)) return seconds;
  }

  return null;
};
