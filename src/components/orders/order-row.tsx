import Link from "next/link";
import { Ban, Eye, FileText, MoreHorizontal, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  formatDateTime,
  formatOrderMoney,
  isCancellable,
  itemCount,
  nextStatuses,
  PAYMENT_METHOD_LABELS,
  STATUS_LABELS,
} from "@/lib/orders";
import type { Order, OrderStatus } from "@/store/api/order/types";

import { OrderStatusBadge, PaymentStatusBadge } from "./order-status-badge";
import type { OrderPermissions } from "./use-order-actions";

type OrderRowProps = {
  order: Order;
  permissions: OrderPermissions;
  onSetStatus: (status: OrderStatus) => void;
  onCancel: () => void;
};

export function OrderRow({ order, permissions, onSetStatus, onCancel }: OrderRowProps) {
  const href = `/orders/${order._id}`;
  const advances = permissions.canUpdateStatus ? nextStatuses(order) : [];
  const cancellable = permissions.canCancel && isCancellable(order);
  const count = itemCount(order);

  return (
    <TableRow>
      <TableCell className="pl-4">
        <Link href={href} className="font-mono font-medium hover:underline">
          #{order.invoice}
        </Link>
        <div className="text-xs text-muted-foreground md:hidden">
          {formatDateTime(order.createdAt)}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{order.address.name}</div>
        <div className="text-xs text-muted-foreground">{order.address.contact}</div>
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {formatDateTime(order.createdAt)}
      </TableCell>
      <TableCell className="hidden text-muted-foreground lg:table-cell">
        {count} {count === 1 ? "item" : "items"}
      </TableCell>
      <TableCell className="font-medium tabular-nums">
        {formatOrderMoney(order.total, order.currency)}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex flex-col items-start gap-1">
          <PaymentStatusBadge status={order.paymentStatus} />
          <span className="text-xs text-muted-foreground">
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <OrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Order actions" />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href={href} />}>
                  <Eye />
                  View order
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href={`${href}/invoice`} />}>
                  <FileText />
                  Invoice
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {advances.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {advances.map((status) => (
                      <DropdownMenuItem key={status} onClick={() => onSetStatus(status)}>
                        <Truck />
                        Mark {STATUS_LABELS[status].toLowerCase()}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
              {cancellable && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onCancel}>
                    <Ban />
                    Cancel order
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
