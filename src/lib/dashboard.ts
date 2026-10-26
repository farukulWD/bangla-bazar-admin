import { format, parseISO, startOfMonth, subDays } from "date-fns";

import type { DashboardRange, Granularity } from "@/store/api/dashboard/types";

const iso = (date: Date) => format(date, "yyyy-MM-dd");

export const RANGE_PRESETS = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
  { key: "365d", label: "Last 12 months", days: 365 },
] as const;

export const presetRange = (days: number, today = new Date()): DashboardRange => ({
  from: iso(subDays(today, days - 1)),
  to: iso(today),
});

export const monthToDate = (today = new Date()): DashboardRange => ({
  from: iso(startOfMonth(today)),
  to: iso(today),
});

export const defaultRange = () => presetRange(30);

export const toIsoDate = iso;

export const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-IN", { notation: "compact" }).format(value);

export const formatCount = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

export const formatBucket = (bucket: string, granularity: Granularity) =>
  granularity === "week"
    ? `Week of ${format(parseISO(bucket), "d MMM")}`
    : format(parseISO(bucket), "d MMM yyyy");

export const formatTick = (bucket: string) => format(parseISO(bucket), "d MMM");

export type Delta = { percent: number; direction: "up" | "down" };

export const deltaPercent = (value: number, previous: number): Delta | null => {
  if (previous === 0) return null;
  const percent = ((value - previous) / previous) * 100;
  return { percent, direction: percent >= 0 ? "up" : "down" };
};

export const isAllZero = (rows: { value: number }[]) =>
  rows.every((row) => row.value === 0);
