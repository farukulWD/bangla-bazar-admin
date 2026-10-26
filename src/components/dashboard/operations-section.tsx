"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatCount } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import { useGetDashboardOperationsQuery } from "@/store/api/dashboard/api/dashboardApi";

import { ChartError, ChartSkeleton } from "./chart-states";
import { DashboardSection } from "./section";

export function OperationsSection() {
  const { data, isLoading, isError, refetch } = useGetDashboardOperationsQuery();

  if (data && data.tiles.length === 0) return null;

  return (
    <DashboardSection
      title="Needs attention"
      description="Current counts — not affected by the date range."
    >
      {isLoading && <ChartSkeleton height={72} />}
      {isError && <ChartError onRetry={() => void refetch()} />}

      {data && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.tiles.map((tile) => (
            <Link
              key={tile.key}
              href={tile.href}
              className={cn(
                "group flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted",
                tile.tone === "warn" && "border-amber-500/50",
              )}
            >
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{tile.label}</p>
                <p className="text-xs text-muted-foreground">
                  {tile.count === 0 ? "All clear" : `${formatCount(tile.count)} waiting`}
                </p>
              </div>
              <span
                className={cn(
                  "flex items-center gap-1 text-lg font-semibold tabular-nums",
                  tile.tone === "warn" && "text-amber-600 dark:text-amber-400",
                )}
              >
                {formatCount(tile.count)}
                <ArrowRight
                  aria-hidden
                  className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                />
              </span>
            </Link>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
