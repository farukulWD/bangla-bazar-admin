"use client";

import { useSession } from "@/store/api/auth/hooks/use-session";

import { useGetUnreadCountQuery } from "../api/notificationApi";

const POLL_INTERVAL_MS = 120_000;

export const useUnreadCount = (): number => {
  const { isStaff } = useSession();

  const { data } = useGetUnreadCountQuery(undefined, {
    skip: !isStaff,
    pollingInterval: POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
  });

  return isStaff ? (data?.count ?? 0) : 0;
};
