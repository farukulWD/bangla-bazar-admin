import { Suspense } from "react";

import AuthGuard, { DashboardSkeleton } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AuthGuard>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </AuthGuard>
    </Suspense>
  );
}
