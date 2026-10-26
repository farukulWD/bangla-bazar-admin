import { Search } from "lucide-react";

import { ALL, FilterSelect } from "@/components/layout/filter-select";
import { Input } from "@/components/ui/input";

export type CustomerFilterValues = {
  search: string;
  status: string;
  from: string;
  to: string;
};

const DAY = /^\d{4}-\d{2}-\d{2}$/;

const STATUSES = ["active", "inactive"];

const day = (value: string | null) => (value && DAY.test(value) ? value : "");

export const readCustomerFilters = (params: URLSearchParams): CustomerFilterValues => {
  const status = params.get("status");

  return {
    search: params.get("q")?.trim() ?? "",
    status: status && STATUSES.includes(status) ? status : ALL,
    from: day(params.get("from")),
    to: day(params.get("to")),
  };
};

const STATUS_FILTERS = [
  { label: "All statuses", value: ALL },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

type CustomerFiltersProps = {
  values: CustomerFilterValues;
  onChange: (change: Partial<CustomerFilterValues>) => void;
};

export function CustomerFilters({ values, onChange }: CustomerFiltersProps) {
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
          placeholder="Search name, email or phone"
          className="h-9 pl-9"
        />
      </div>
      <FilterSelect
        items={STATUS_FILTERS}
        value={values.status}
        onChange={(status) => onChange({ status })}
      />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="shrink-0">Joined</span>
        <Input
          type="date"
          aria-label="Joined from"
          value={values.from}
          max={values.to || undefined}
          onChange={(event) => onChange({ from: event.target.value })}
          className="h-9 w-full sm:w-36"
        />
        <span>–</span>
        <Input
          type="date"
          aria-label="Joined to"
          value={values.to}
          min={values.from || undefined}
          onChange={(event) => onChange({ to: event.target.value })}
          className="h-9 w-full sm:w-36"
        />
      </div>
    </div>
  );
}
