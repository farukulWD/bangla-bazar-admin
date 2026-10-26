import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { deltaPercent } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import type { Scalar } from "@/store/api/dashboard/types";

function DeltaBadge({
  value,
  previous,
  higherIsBetter,
}: Scalar & { higherIsBetter: boolean }) {
  const delta = deltaPercent(value, previous);
  if (!delta) return null;

  const Icon = delta.direction === "up" ? ArrowUpRight : ArrowDownRight;
  const good = higherIsBetter ? delta.direction === "up" : delta.direction === "down";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        good ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
      )}
    >
      <Icon className="size-3" aria-hidden />
      {delta.percent >= 0 ? "+" : ""}
      {delta.percent.toFixed(1)}%
    </span>
  );
}

export function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  delta,
  higherIsBetter = true,
}: {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  delta?: Scalar;
  higherIsBetter?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
            {delta && <DeltaBadge {...delta} higherIsBetter={higherIsBetter} />}
          </div>
          <p className="text-xs text-muted-foreground">{caption}</p>
        </div>
      </CardContent>
    </Card>
  );
}
