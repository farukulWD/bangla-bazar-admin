import { Search } from "lucide-react";

import { ALL, FilterSelect } from "@/components/layout/filter-select";
import { Input } from "@/components/ui/input";
import {
  ORDER_STATUSES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
  STATUS_LABELS,
} from "@/lib/orders";

export type OrderFilterValues = {
  search: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  from: string;
  to: string;
};

const DAY = /^\d{4}-\d{2}-\d{2}$/;

const oneOf = (value: string | null, allowed: readonly string[]) =>
  value && allowed.includes(value) ? value : ALL;

const day = (value: string | null) => (value && DAY.test(value) ? value : "");

export const readOrderFilters = (params: URLSearchParams): OrderFilterValues => ({
  search: params.get("q")?.trim() ?? "",
  status: oneOf(params.get("status"), ORDER_STATUSES),
  paymentStatus: oneOf(params.get("paymentStatus"), PAYMENT_STATUSES),
  paymentMethod: oneOf(params.get("paymentMethod"), PAYMENT_METHODS),
  from: day(params.get("from")),
  to: day(params.get("to")),
});

const STATUS_FILTERS = [
  { label: "All statuses", value: ALL },
  ...ORDER_STATUSES.map((value) => ({ label: STATUS_LABELS[value], value })),
];

const PAYMENT_STATUS_FILTERS = [
  { label: "All payments", value: ALL },
  ...PAYMENT_STATUSES.map((value) => ({ label: PAYMENT_STATUS_LABELS[value], value })),
];

const PAYMENT_METHOD_FILTERS = [
  { label: "All methods", value: ALL },
  ...PAYMENT_METHODS.map((value) => ({ label: PAYMENT_METHOD_LABELS[value], value })),
];

type OrderFiltersProps = {
  values: OrderFilterValues;
  onChange: (change: Partial<OrderFilterValues>) => void;
};

export function OrderFilters({ values, onChange }: OrderFiltersProps) {
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
          placeholder="Search invoice, name or phone"
          className="h-9 pl-9"
        />
      </div>
      <FilterSelect
        items={STATUS_FILTERS}
        value={values.status}
        onChange={(status) => onChange({ status })}
      />
      <FilterSelect
        items={PAYMENT_STATUS_FILTERS}
        value={values.paymentStatus}
        onChange={(paymentStatus) => onChange({ paymentStatus })}
      />
      <FilterSelect
        items={PAYMENT_METHOD_FILTERS}
        value={values.paymentMethod}
        onChange={(paymentMethod) => onChange({ paymentMethod })}
      />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="shrink-0">Placed</span>
        <Input
          type="date"
          aria-label="Placed from"
          value={values.from}
          max={values.to || undefined}
          onChange={(event) => onChange({ from: event.target.value })}
          className="h-9 w-full sm:w-36"
        />
        <span>–</span>
        <Input
          type="date"
          aria-label="Placed to"
          value={values.to}
          min={values.from || undefined}
          onChange={(event) => onChange({ to: event.target.value })}
          className="h-9 w-full sm:w-36"
        />
      </div>
    </div>
  );
}
