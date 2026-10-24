"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCompact, isAllZero } from "@/lib/dashboard";
import type { Category } from "@/store/api/dashboard/types";

import { ChartEmpty } from "./chart-states";

export function BarListChart({
  data,
  label,
  emptyMessage,
  labelWidth = 110,
  tick = formatCompact,
  color = "var(--chart-1)",
}: {
  data: Category[];
  label: string;
  emptyMessage?: string;
  labelWidth?: number;
  tick?: (value: number) => string;
  color?: string;
}) {
  if (data.length === 0 || isAllZero(data)) {
    return <ChartEmpty message={emptyMessage} />;
  }

  const config = { value: { label, color } } satisfies ChartConfig;
  const height = Math.max(160, data.length * 40);

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickFormatter={tick}
          allowDecimals={false}
        />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          axisLine={false}
          width={labelWidth}
          tickFormatter={(value: string) =>
            value.length > 16 ? `${value.slice(0, 15)}…` : value
          }
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
