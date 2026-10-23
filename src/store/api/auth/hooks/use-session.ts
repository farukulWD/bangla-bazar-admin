"use client";

import { useSyncExternalStore } from "react";

import { getAuthToken, subscribeToAuthToken } from "../../token";
import { useGetMeQuery } from "../api/authApi";
import { isStaff, type SessionUser } from "../types";

export type Session = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isStaff: boolean;

  isLoading: boolean;
};

export const useSession = (): Session => {
  const token = useSyncExternalStore(
    subscribeToAuthToken,
    getAuthToken,
    () => null,
  );

  const hydrated = useSyncExternalStore(
    subscribeToAuthToken,
    () => true,
    () => false,
  );

  const { data, error, isLoading, isUninitialized } = useGetMeQuery(undefined, {
    skip: !token,
  });

  const user = token && !error ? (data ?? null) : null;

  return {
    user,
    isAuthenticated: Boolean(user),
    isStaff: user ? isStaff(user.userType) : false,
    isLoading: !hydrated || (Boolean(token) && (isUninitialized || isLoading)),
  };
};
