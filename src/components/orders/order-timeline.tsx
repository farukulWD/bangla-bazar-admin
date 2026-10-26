import { cn } from "cn";

import { formatDateTime, STATUS_LABELS } from "@/lib/orders";
import type { Order } from "@/store/api/order/types";

const actorLabel = (order: Order, entry: Order["statusHistory"][number]) => {
  if (!entry.by) return entry.status === "pending" ? "Customer" : "System";
  if (order.user && entry.by._id === order.user._id) return "Customer";
  return entry.by.name ?? "Staff";
};

export function OrderTimeline({ order }: { order: Order }) {
  const entries = [...order.statusHistory].reverse();

  return (
    <ol className="space-y-4">
      {entries.map((entry, index) => (
        <li key={`${entry.status}-${entry.at}`} className="flex gap-3">
          <span
            aria-hidden
            className={cn(
              "mt-1.5 size-2 shrink-0 rounded-full",
              index === 0 ? "bg-primary" : "bg-muted-foreground/40",
              entry.status === "cancelled" && "bg-destructive",
            )}
          />
          <div>
            <div className="font-medium">{STATUS_LABELS[entry.status]}</div>
            <div className="text-xs text-muted-foreground">
              {formatDateTime(entry.at)} · {actorLabel(order, entry)}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
