import Link from "next/link";
import { Eye, MoreHorizontal, Power, ShoppingBag, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatMoney } from "@/lib/coupons";
import { formatDateTime } from "@/lib/orders";
import type { Customer } from "@/store/api/user/types";

import type { CustomerPermissions } from "./use-customer-actions";

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function CustomerStatusBadge({ status }: { status: Customer["status"] }) {
  return (
    <Badge variant={status === "active" ? "default" : "outline"}>
      {status === "active" ? "Active" : "Inactive"}
    </Badge>
  );
}

type CustomerRowProps = {
  customer: Customer;
  currency: string;
  selected: boolean;
  selectable: boolean;
  permissions: CustomerPermissions;
  onSelect: (checked: boolean) => void;
  onToggleStatus: () => void;
  onDelete: () => void;
};

export function CustomerRow({
  customer,
  currency,
  selected,
  selectable,
  permissions,
  onSelect,
  onToggleStatus,
  onDelete,
}: CustomerRowProps) {
  const href = `/customers/${customer._id}`;
  const active = customer.status === "active";

  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell className="w-10 pl-4">
        {selectable && (
          <Checkbox
            aria-label={`Select ${customer.name}`}
            checked={selected}
            onCheckedChange={onSelect}
          />
        )}
      </TableCell>
      <TableCell>
        <Link href={href} className="flex items-center gap-3">
          <Avatar className="size-8">
            {customer.image && <AvatarImage src={customer.image} alt="" />}
            <AvatarFallback className="text-xs">{initials(customer.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium hover:underline">{customer.name}</div>
            <div className="truncate text-xs text-muted-foreground md:hidden">
              {customer.email ?? customer.phone}
            </div>
          </div>
        </Link>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div>{customer.email ?? "—"}</div>
        <div className="text-xs text-muted-foreground">{customer.phone}</div>
      </TableCell>
      <TableCell className="tabular-nums">{customer.orderCount.toLocaleString()}</TableCell>
      <TableCell className="font-medium tabular-nums">
        {formatMoney(customer.totalSpent, currency)}
      </TableCell>
      <TableCell className="hidden text-muted-foreground xl:table-cell">
        {customer.lastOrderAt ? formatDateTime(customer.lastOrderAt) : "—"}
      </TableCell>
      <TableCell className="hidden text-muted-foreground lg:table-cell">
        {dateFormat.format(new Date(customer.createdAt))}
      </TableCell>
      <TableCell>
        <CustomerStatusBadge status={customer.status} />
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Customer actions" />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href={href} />}>
                  <Eye />
                  View customer
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href={`/orders?userId=${customer._id}`} />}
                >
                  <ShoppingBag />
                  View orders
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {permissions.canToggle && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onToggleStatus}>
                    <Power />
                    {active ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                </>
              )}
              {permissions.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2 />
                    Delete
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
