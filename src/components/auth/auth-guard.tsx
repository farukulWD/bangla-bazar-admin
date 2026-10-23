"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { useLogoutMutation } from "@/store/api/auth/api/authApi";
import { useSession } from "@/store/api/auth/hooks/use-session";
import { getAuthToken } from "@/store/api/token";

export const DashboardSkeleton = () => (
  <div className="flex min-h-svh w-full gap-4 p-4">
    <Skeleton className="hidden h-[calc(100svh-2rem)] w-64 md:block" />
    <div className="flex flex-1 flex-col gap-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isStaff, isLoading } = useSession();
  const [logout] = useLogoutMutation();

  const isCustomer = isAuthenticated && !isStaff;

  useEffect(() => {
    if (isLoading) return;

    if (isCustomer) {
      void logout();
      router.replace("/login");
      return;
    }

    if (isAuthenticated || getAuthToken()) return;

    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isAuthenticated, isCustomer, isLoading, logout, pathname, router]);

  if (!isLoading && (!user || isCustomer)) {
    return <DashboardSkeleton />;
  }

  return <>{children}</>;
};

export default AuthGuard;
