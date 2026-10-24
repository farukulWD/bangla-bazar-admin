import { Package } from "lucide-react";

import { formatOrderMoney } from "@/lib/orders";
import type { Order } from "@/store/api/order/types";

export function OrderItems({ order }: { order: Order }) {
  const money = (value: number) => formatOrderMoney(value, order.currency);

  return (
    <div className="divide-y">
      {order.items.map((item, index) => (
        <div key={`${item.product}-${item.variant ?? index}`} className="flex gap-3 py-3 first:pt-0">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40 text-muted-foreground">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt="" className="size-full object-cover" />
            ) : (
              <Package aria-hidden className="size-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium">{item.title}</div>
            {item.options.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {item.options.map((option) => `${option.attribute}: ${option.value}`).join(" · ")}
              </div>
            )}
            {item.sku && (
              <div className="font-mono text-xs text-muted-foreground">{item.sku}</div>
            )}
          </div>
          <div className="text-right tabular-nums">
            <div className="font-medium">{money(item.lineTotal)}</div>
            <div className="text-xs text-muted-foreground">
              {money(item.price)} × {item.qty}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderTotals({ order }: { order: Order }) {
  const money = (value: number) => formatOrderMoney(value, order.currency);

  return (
    <dl className="space-y-2 tabular-nums">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd>{money(order.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Shipping</dt>
        <dd>{order.shippingCost > 0 ? money(order.shippingCost) : "Free"}</dd>
      </div>
      {order.discount > 0 && (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Discount{order.coupon && <span className="font-mono"> ({order.coupon.code})</span>}
          </dt>
          <dd>-{money(order.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t pt-2 text-base font-semibold">
        <dt>Total</dt>
        <dd>{money(order.total)}</dd>
      </div>
    </dl>
  );
}
