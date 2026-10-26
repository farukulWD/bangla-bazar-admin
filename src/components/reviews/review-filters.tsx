import { Search } from "lucide-react";

import { ALL, FilterSelect } from "@/components/layout/filter-select";
import { Input } from "@/components/ui/input";
import { REVIEW_RATINGS, REVIEW_STATUS_LABELS, REVIEW_STATUSES } from "@/lib/reviews";

export type ReviewFilterValues = {
  search: string;
  status: string;
  rating: string;
};

const oneOf = (value: string | null, allowed: readonly string[]) =>
  value && allowed.includes(value) ? value : ALL;

export const readReviewFilters = (params: URLSearchParams): ReviewFilterValues => ({
  search: params.get("q")?.trim() ?? "",
  status: oneOf(params.get("status"), REVIEW_STATUSES),
  rating: oneOf(params.get("rating"), REVIEW_RATINGS),
});

const STATUS_FILTERS = [
  { label: "All statuses", value: ALL },
  ...REVIEW_STATUSES.map((value) => ({ label: REVIEW_STATUS_LABELS[value], value })),
];

const RATING_FILTERS = [
  { label: "All ratings", value: ALL },
  ...REVIEW_RATINGS.map((value) => ({
    label: `${value} star${value === "1" ? "" : "s"}`,
    value,
  })),
];

type ReviewFiltersProps = {
  values: ReviewFilterValues;
  onChange: (change: Partial<ReviewFilterValues>) => void;
};

export function ReviewFilters({ values, onChange }: ReviewFiltersProps) {
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
          placeholder="Search title or comment"
          className="h-9 pl-9"
        />
      </div>
      <FilterSelect
        items={STATUS_FILTERS}
        value={values.status}
        onChange={(status) => onChange({ status })}
      />
      <FilterSelect
        items={RATING_FILTERS}
        value={values.rating}
        onChange={(rating) => onChange({ rating })}
      />
    </div>
  );
}
