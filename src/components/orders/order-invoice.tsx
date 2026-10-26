"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/coupons";
import {
  formatAddress,
  formatOrderMoney,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_LABELS,
} from "@/lib/orders";
import { useGetOrderQuery } from "@/store/api/order/api/orderApi";

import { OrderTotals } from "./order-items";

export function OrderInvoice() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useGetOrderQuery(id);

  if (isLoading) {
    return <Skeleton className="mx-auto h-[600px] w-full max-w-3xl" />;
  }

  if (error || !order) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Order not found.")}
      </p>
    );
  }

  const money = (value: number) => formatOrderMoney(value, order.currency);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex justify-between gap-2 print:hidden">
        <Button
          variant="outline"
          render={<Link href={`/orders/${order._id}`} />}
          nativeButton={false}
        >
          <ArrowLeft />
          Back to order
        </Button>
        <Button onClick={() => window.print()}>
          <Printer />
          Print
        </Button>
      </div>

      <article className="space-y-8 rounded-xl bg-card p-8 text-sm text-card-foreground ring-1 ring-foreground/10 print:rounded-none print:bg-white print:p-0 print:text-black print:ring-0 print:**:border-neutral-300 print:**:text-black">
        <header className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="font-heading text-2xl font-semibold">Invoice</h1>
            <p className="text-muted-foreground">Bangla Bazar</p>
          </div>
          <dl className="space-y-1 sm:text-right">
            <div>
              <dt className="inline text-muted-foreground">Invoice no. </dt>
              <dd className="inline font-mono font-medium">#{order.invoice}</dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">Date </dt>
              <dd className="inline">{formatDate(order.createdAt)}</dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">Status </dt>
              <dd className="inline">{STATUS_LABELS[order.status]}</dd>
            </div>
          </dl>
        </header>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Bill to
            </h2>
            <div className="font-medium">{order.address.name}</div>
            <div>{order.address.contact}</div>
            {order.address.email && <div>{order.address.email}</div>}
            <div>{formatAddress(order.address)}</div>
          </div>
          <div className="space-y-1 sm:text-right">
            <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Payment
            </h2>
            <div>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</div>
            <div>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</div>
          </div>
        </section>

        <table className="w-full tabular-nums">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground uppercase">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-right font-medium">Price</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={`${item.product}-${item.variant ?? index}`} className="border-b">
                <td className="py-3 pr-4">
                  <div className="font-medium">{item.title}</div>
                  {item.options.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {item.options
                        .map((option) => `${option.attribute}: ${option.value}`)
                        .join(" · ")}
                    </div>
                  )}
                </td>
                <td className="py-3 text-right">{money(item.price)}</td>
                <td className="py-3 text-right">{item.qty}</td>
                <td className="py-3 text-right">{money(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto w-full max-w-xs">
          <OrderTotals order={order} />
        </div>

        <footer className="border-t pt-4 text-center text-xs text-muted-foreground">
          Thank you for shopping with Bangla Bazar.
        </footer>
      </article>
    </div>
  );
}
