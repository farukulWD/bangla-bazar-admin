import { Search } from "lucide-react";

import { ALL, FilterSelect } from "@/components/layout/filter-select";
import { Input } from "@/components/ui/input";
import { PAYMENT_STATE_LABELS, PAYMENT_STATES } from "@/lib/payments";

export type PaymentFilterValues = {
  search: string;
  status: string;
  from: string;
  to: string;
};

const DAY = /^\d{4}-\d{2}-\d{2}$/;

const oneOf = (value: string | null, allowed: readonly string[]) =>
  value && allowed.includes(value) ? value : ALL;

const day = (value: string | null) => (value && DAY.test(value) ? value : "");

export const readPaymentFilters = (params: URLSearchParams): PaymentFilterValues => ({
  search: params.get("q")?.trim() ?? "",
  status: oneOf(params.get("status"), PAYMENT_STATES),
  from: day(params.get("from")),
  to: day(params.get("to")),
});

const STATUS_FILTERS = [
  { label: "All statuses", value: ALL },
  ...PAYMENT_STATES.map((value) => ({ label: PAYMENT_STATE_LABELS[value], value })),
];

type PaymentFiltersProps = {
  values: PaymentFilterValues;
  onChange: (change: Partial<PaymentFilterValues>) => void;
};

export function PaymentFilters({ values, onChange }: PaymentFiltersProps) {
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
          placeholder="Invoice, transaction or validation ID"
          className="h-9 pl-9"
        />
      </div>
      <FilterSelect
        items={STATUS_FILTERS}
        value={values.status}
        onChange={(status) => onChange({ status })}
      />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="shrink-0">Created</span>
        <Input
          type="date"
          aria-label="Created from"
          value={values.from}
          max={values.to || undefined}
          onChange={(event) => onChange({ from: event.target.value })}
          className="h-9 w-full sm:w-36"
        />
        <span>–</span>
        <Input
          type="date"
          aria-label="Created to"
          value={values.to}
          min={values.from || undefined}
          onChange={(event) => onChange({ to: event.target.value })}
          className="h-9 w-full sm:w-36"
        />
      </div>
    </div>
  );
}
