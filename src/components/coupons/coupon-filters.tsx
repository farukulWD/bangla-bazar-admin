import { Search } from "lucide-react";

import { ALL, FilterSelect } from "@/components/layout/filter-select";
import { Input } from "@/components/ui/input";

export type CouponFilterValues = {
  search: string;
  status: string;
  from: string;
  to: string;
};

export const EMPTY_COUPON_FILTERS: CouponFilterValues = {
  search: "",
  status: ALL,
  from: "",
  to: "",
};

const STATUS_FILTERS = [
  { label: "All statuses", value: ALL },
  { label: "Showing", value: "show" },
  { label: "Hidden", value: "hide" },
];

type CouponFiltersProps = {
  values: CouponFilterValues;
  onChange: (change: Partial<CouponFilterValues>) => void;
};

export function CouponFilters({ values, onChange }: CouponFiltersProps) {
  return (
    <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:max-w-sm">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={values.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Search title or code"
          className="h-9 pl-9"
        />
      </div>
      <FilterSelect
        items={STATUS_FILTERS}
        value={values.status}
        onChange={(status) => onChange({ status })}
      />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="shrink-0">Expires</span>
        <Input
          type="date"
          aria-label="Expires from"
          value={values.from}
          max={values.to || undefined}
          onChange={(event) => onChange({ from: event.target.value })}
          className="h-9 w-full sm:w-36"
        />
        <span>–</span>
        <Input
          type="date"
          aria-label="Expires to"
          value={values.to}
          min={values.from || undefined}
          onChange={(event) => onChange({ to: event.target.value })}
          className="h-9 w-full sm:w-36"
        />
      </div>
    </div>
  );
}
