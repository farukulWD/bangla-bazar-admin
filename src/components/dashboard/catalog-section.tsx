"use client";

import { skipToken } from "@reduxjs/toolkit/query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCount } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import { useGetDashboardCatalogQuery } from "@/store/api/dashboard/api/dashboardApi";

import { BarListChart } from "./bar-list-chart";
import { ChartError, ChartSkeleton } from "./chart-states";
import { DonutChart } from "./donut-chart";
import { DashboardSection } from "./section";

export function CatalogSection() {
  const { user } = useSession();
  const allowed = can(user, "product", "can_view_products");
  const { data, isLoading, isError, refetch } = useGetDashboardCatalogQuery(
    allowed ? undefined : skipToken,
  );

  if (!allowed) return null;

  return (
    <DashboardSection
      title="Catalog"
      description={
        data
          ? `${formatCount(data.totalProducts)} products — not affected by the date range.`
          : "Not affected by the date range."
      }
    >
      {isLoading && <ChartSkeleton height={110} />}
      {isError && <ChartError onRetry={() => void refetch()} />}

      {data && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={data.stockSplit} label="Products" emptyMessage="No products yet" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={data.statusSplit} label="Products" emptyMessage="No products yet" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Products per category</CardTitle>
            </CardHeader>
            <CardContent>
              <BarListChart
                data={data.productsPerCategory}
                label="Products"
                color="var(--chart-3)"
                emptyMessage="No products yet"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardSection>
  );
}
