"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { Ban, BadgeDollarSign, Receipt, ShoppingCart, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/coupons";
import { formatCompact, formatCount } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import { useGetDashboardCommercialQuery } from "@/store/api/dashboard/api/dashboardApi";
import type { DashboardRange } from "@/store/api/dashboard/types";
import { useGetPublicSettingsQuery } from "@/store/api/settings/api/settingsApi";

import { BarListChart } from "./bar-list-chart";
import { ChartError, ChartSkeleton } from "./chart-states";
import { DonutChart } from "./donut-chart";
import { DashboardSection } from "./section";
import { StatCard } from "./stat-card";
import { TrendChart } from "./trend-chart";

export function CommercialSection({ range }: { range: DashboardRange }) {
  const { user } = useSession();
  const allowed = can(user, "order", "can_view_orders");
  const { data, isLoading, isError, refetch } = useGetDashboardCommercialQuery(
    allowed ? range : skipToken,
  );
  const { data: settings } = useGetPublicSettingsQuery();
  const currency = settings?.store?.currencySymbol ?? "৳";

  if (!allowed) return null;

  const money = (value: number) => formatMoney(value, currency);
  const compactMoney = (value: number) => `${currency}${formatCompact(value)}`;

  return (
    <DashboardSection title="Sales">
      {isLoading && <ChartSkeleton height={110} />}
      {isError && <ChartError onRetry={() => void refetch()} />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={BadgeDollarSign}
              label="Revenue"
              value={money(data.revenue.value)}
              caption="Paid in this range, excl. cancelled"
              delta={data.revenue}
            />
            <StatCard
              icon={ShoppingCart}
              label="Orders"
              value={formatCount(data.orders.value)}
              caption="Placed in this range"
              delta={data.orders}
            />
            <StatCard
              icon={Receipt}
              label="Avg. order value"
              value={money(data.averageOrderValue.value)}
              caption="Revenue ÷ paid orders"
              delta={data.averageOrderValue}
            />
            <StatCard
              icon={Wallet}
              label="Receivables"
              value={money(data.receivables)}
              caption="Unpaid, not cancelled — as of now"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue &amp; orders</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart
                  leftTick={compactMoney}
                  lines={[
                    { key: "revenue", label: "Revenue", series: data.revenueSeries, kind: "area" },
                    {
                      key: "orders",
                      label: "Orders",
                      series: data.orderSeries,
                      kind: "line",
                      axis: "right",
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <StatCard
                icon={Ban}
                label="Cancelled orders"
                value={formatCount(data.cancelledOrders.value)}
                caption="Cancelled in this range"
                delta={data.cancelledOrders}
                higherIsBetter={false}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Payment mix</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart
                    data={data.paymentMix}
                    label="Orders"
                    emptyMessage="No orders in this range"
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Orders by status</CardTitle>
              </CardHeader>
              <CardContent>
                <BarListChart
                  data={data.statusFunnel}
                  label="Orders"
                  labelWidth={84}
                  emptyMessage="No orders in this range"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top products</CardTitle>
              </CardHeader>
              <CardContent>
                <BarListChart
                  data={data.topProducts}
                  label="Revenue"
                  tick={compactMoney}
                  emptyMessage="No products sold in this range"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders by city</CardTitle>
              </CardHeader>
              <CardContent>
                <BarListChart
                  data={data.ordersByCity}
                  label="Orders"
                  color="var(--chart-2)"
                  emptyMessage="No orders in this range"
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardSection>
  );
}
