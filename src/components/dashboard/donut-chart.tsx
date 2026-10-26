"use client";

import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCount, isAllZero } from "@/lib/dashboard";
import type { Category } from "@/store/api/dashboard/types";

import { ChartEmpty } from "./chart-states";

const SLICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-2)",
];

export function DonutChart({
  data,
  label,
  emptyMessage,
}: {
  data: Category[];
  label: string;
  emptyMessage?: string;
}) {
  if (isAllZero(data)) {
    return <ChartEmpty message={emptyMessage} />;
  }

  const config = { value: { label } } satisfies ChartConfig;
  const colorOf = (index: number) => SLICE_COLORS[index % SLICE_COLORS.length];

  return (
    <div className="space-y-3">
      <ChartContainer config={config} className="mx-auto aspect-square h-44">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={48} strokeWidth={2}>
            {data.map((row, index) => (
              <Cell key={row.key} fill={colorOf(index)} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <ul className="space-y-1">
        {data.map((row, index) => (
          <li key={row.key} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ background: colorOf(index) }}
              aria-hidden
            />
            <span className="text-muted-foreground">{row.label}</span>
            <span className="ml-auto font-medium tabular-nums">{formatCount(row.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
