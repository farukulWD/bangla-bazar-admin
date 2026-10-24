import { cn } from "cn";

import { ALL } from "@/components/layout/filter-select";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/orders";
import { useGetOrderStatsQuery } from "@/store/api/order/api/orderApi";

type OrderStatCardsProps = {
  active: string;
  onSelect: (status: string) => void;
};

export function OrderStatCards({ active, onSelect }: OrderStatCardsProps) {
  const { data: stats, isLoading } = useGetOrderStatsQuery();

  const cards = [
    { value: ALL, label: "All orders", count: stats?.total },
    ...ORDER_STATUSES.map((status) => ({
      value: status,
      label: STATUS_LABELS[status],
      count: stats?.[status],
    })),
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <button
          key={card.value}
          type="button"
          aria-pressed={active === card.value}
          onClick={() => onSelect(card.value)}
          className={cn(
            "rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50",
            active === card.value && "border-primary ring-1 ring-primary",
          )}
        >
          <div className="text-xs text-muted-foreground">{card.label}</div>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-12" />
          ) : (
            <div className="mt-1 font-heading text-2xl font-semibold tabular-nums">
              {(card.count ?? 0).toLocaleString()}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
