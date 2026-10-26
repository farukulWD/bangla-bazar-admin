"use client";

import { usePathname } from "next/navigation";

import { getRequiredPermission } from "@/config/nav";
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";

import { AccessDenied } from "./access-denied";

export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useSession();
  const required = getRequiredPermission(pathname);

  if (
    !isLoading &&
    user &&
    required &&
    !can(user, required.module, required.permission)
  ) {
    return <AccessDenied />;
  }

  return children;
}
