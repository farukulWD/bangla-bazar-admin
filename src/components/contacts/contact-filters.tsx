import { Search } from "lucide-react";

import { ALL, FilterSelect } from "@/components/layout/filter-select";
import { Input } from "@/components/ui/input";
import { CONTACT_STATUS_LABELS, CONTACT_STATUSES } from "@/lib/contacts";

export type ContactFilterValues = {
  search: string;
  status: string;
};

const oneOf = (value: string | null, allowed: readonly string[]) =>
  value && allowed.includes(value) ? value : ALL;

export const readContactFilters = (params: URLSearchParams): ContactFilterValues => ({
  search: params.get("q")?.trim() ?? "",
  status: oneOf(params.get("status"), CONTACT_STATUSES),
});

const STATUS_FILTERS = [
  { label: "All statuses", value: ALL },
  ...CONTACT_STATUSES.map((value) => ({ label: CONTACT_STATUS_LABELS[value], value })),
];

type ContactFiltersProps = {
  values: ContactFilterValues;
  onChange: (change: Partial<ContactFilterValues>) => void;
};

export function ContactFilters({ values, onChange }: ContactFiltersProps) {
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
          placeholder="Search name, email or subject"
          className="h-9 pl-9"
        />
      </div>
      <FilterSelect
        items={STATUS_FILTERS}
        value={values.status}
        onChange={(status) => onChange({ status })}
      />
    </div>
  );
}
