import Link from "next/link";
import { Eye, MoreHorizontal, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/orders";
import { formatPaymentAmount } from "@/lib/payments";
import type { Payment } from "@/store/api/payment/types";

import { PaymentStateBadge } from "./payment-status-badge";

export function PaymentRow({ payment }: { payment: Payment }) {
  const href = `/payments/${payment.id}`;
  const orderHref = payment.order ? `/orders/${payment.order._id}` : null;
  const card = [payment.cardType, payment.cardIssuer].filter(Boolean).join(" · ");

  return (
    <TableRow>
      <TableCell className="pl-4">
        <Link href={href} className="font-mono font-medium hover:underline">
          #{payment.invoice}
        </Link>
        <div className="text-xs text-muted-foreground md:hidden">
          {formatDateTime(payment.createdAt)}
        </div>
      </TableCell>
      <TableCell>
        {payment.user ? (
          <>
            <div className="font-medium">{payment.user.name}</div>
            <div className="text-xs text-muted-foreground">
              {payment.user.email || payment.user.phone}
            </div>
          </>
        ) : (
          <span className="text-muted-foreground">Deleted account</span>
        )}
      </TableCell>
      <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
        {payment.tranId}
      </TableCell>
      <TableCell className="font-medium tabular-nums">
        {formatPaymentAmount(payment.amount, payment.currency)}
      </TableCell>
      <TableCell className="hidden text-muted-foreground lg:table-cell">
        {card || "—"}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-1">
          <PaymentStateBadge status={payment.status} />
          {payment.duplicate && <Badge variant="outline">Duplicate</Badge>}
        </div>
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {formatDateTime(payment.createdAt)}
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Payment actions" />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href={href} />}>
                  <Eye />
                  View payment
                </DropdownMenuItem>
                {orderHref && (
                  <DropdownMenuItem render={<Link href={orderHref} />}>
                    <ShoppingCart />
                    View order
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
