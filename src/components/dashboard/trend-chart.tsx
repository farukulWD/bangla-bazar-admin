"use client";

import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatBucket, formatCompact, formatTick, isAllZero } from "@/lib/dashboard";
import type { Series } from "@/store/api/dashboard/types";

import { ChartEmpty } from "./chart-states";

const PALETTE = ["var(--chart-1)", "var(--chart-3)", "var(--chart-4)"];

type TrendLine = {
  key: string;
  label: string;
  series: Series;
  kind: "area" | "line";
  axis?: "left" | "right";
};

export function TrendChart({
  lines,
  leftTick = formatCompact,
}: {
  lines: TrendLine[];
  leftTick?: (value: number) => string;
}) {
  if (lines.every((line) => isAllZero(line.series.points))) {
    return <ChartEmpty />;
  }

  const [first] = lines;
  const granularity = first.series.granularity;
  const hasRight = lines.some((line) => line.axis === "right");

  const config = Object.fromEntries(
    lines.map((line, index) => [
      line.key,
      { label: line.label, color: PALETTE[index % PALETTE.length] },
    ]),
  ) satisfies ChartConfig;

  const data = first.series.points.map((point, index) => ({
    bucket: point.bucket,
    ...Object.fromEntries(
      lines.map((line) => [line.key, line.series.points[index]?.value ?? 0]),
    ),
  }));

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <ComposedChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="bucket"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatTick}
          minTickGap={24}
        />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={leftTick}
        />
        {hasRight && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={32}
            allowDecimals={false}
          />
        )}
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                formatBucket(String(payload?.[0]?.payload?.bucket ?? ""), granularity)
              }
            />
          }
        />
        {lines.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {lines.map((line) =>
          line.kind === "area" ? (
            <Area
              key={line.key}
              yAxisId={line.axis ?? "left"}
              dataKey={line.key}
              type="monotone"
              stroke={`var(--color-${line.key})`}
              fill={`var(--color-${line.key})`}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ) : (
            <Line
              key={line.key}
              yAxisId={line.axis ?? "left"}
              dataKey={line.key}
              type="monotone"
              stroke={`var(--color-${line.key})`}
              strokeWidth={2}
              dot={false}
            />
          ),
        )}
      </ComposedChart>
    </ChartContainer>
  );
}
