"use client";

import { useEffect } from "react";

import { postAuthRedirect } from "@/lib/post-auth-redirect";
import { useSession } from "@/store/api/auth/hooks/use-session";

export const useRedirectIfAuthenticated = (next: string | null): void => {
  const { isAuthenticated, isStaff } = useSession();

  useEffect(() => {
    if (isAuthenticated && isStaff) postAuthRedirect(next ?? "/dashboard");
  }, [isAuthenticated, isStaff, next]);
};
