"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCount } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import { useGetDashboardGrowthQuery } from "@/store/api/dashboard/api/dashboardApi";
import type { Category, DashboardRange } from "@/store/api/dashboard/types";

import { ChartError, ChartSkeleton } from "./chart-states";
import { DashboardSection } from "./section";
import { StatCard } from "./stat-card";
import { TrendChart } from "./trend-chart";

function Figures({ rows }: { rows: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.key} className="space-y-0.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {row.label}
          </p>
          <p className="text-xl font-semibold tabular-nums">{formatCount(row.value)}</p>
        </div>
      ))}
    </div>
  );
}

export function GrowthSection({ range }: { range: DashboardRange }) {
  const { user } = useSession();
  const allowed = can(user, "user", "can_view_users");
  const { data, isLoading, isError, refetch } = useGetDashboardGrowthQuery(
    allowed ? range : skipToken,
  );

  if (!allowed) return null;

  return (
    <DashboardSection title="Customers">
      {isLoading && <ChartSkeleton height={110} />}
      {isError && <ChartError onRetry={() => void refetch()} />}

      {data && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sign-ups</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart
                lines={[
                  { key: "signups", label: "Sign-ups", series: data.signupSeries, kind: "area" },
                ]}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <StatCard
              icon={UserPlus}
              label="New customers"
              value={formatCount(data.signups.value)}
              caption="Signed up in this range"
              delta={data.signups}
            />
            <Card>
              <CardHeader>
                <CardTitle>All customers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Figures rows={data.activeSplit} />
                <Figures rows={data.verifiedSplit} />
                <p className="text-xs text-muted-foreground">
                  Not affected by the date range.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardSection>
  );
}
