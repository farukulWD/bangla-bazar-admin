"use client";

import { useMemo, useSyncExternalStore } from "react";

import type { PasswordResetChallenge } from "@/store/api/auth/types";

const STORAGE_KEY = "bb_admin_password_reset";

export type ResetSession = {
  challenge?: PasswordResetChallenge;
  resetToken?: string;
};

const subscribe = () => () => {};

const readRaw = (): string => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};

const parse = (raw: string): ResetSession | null => {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ResetSession;
  } catch {
    return null;
  }
};

export const writeResetSession = (value: ResetSession): void => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {}
};

export const clearResetSession = (): void => {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const useResetSession = (): ResetSession | null | undefined => {
  const raw = useSyncExternalStore<string | null>(subscribe, readRaw, () => null);

  return useMemo(() => (raw === null ? undefined : parse(raw)), [raw]);
};
