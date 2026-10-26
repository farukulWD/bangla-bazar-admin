import Link from "next/link";
import { Pencil, TicketPercent, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate, formatDiscount, formatMoney } from "@/lib/coupons";
import type { Coupon } from "@/store/api/coupon/types";

import { CouponStateBadge } from "./coupon-state-badge";

export type CouponRowPermissions = {
  canBulk: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
};

type CouponRowProps = {
  coupon: Coupon;
  currency: string;
  selected: boolean;
  permissions: CouponRowPermissions;
  onSelect: (checked: boolean) => void;
  onToggleStatus: (show: boolean) => void;
  onDelete: () => void;
};

export function CouponRow({
  coupon,
  currency,
  selected,
  permissions,
  onSelect,
  onToggleStatus,
  onDelete,
}: CouponRowProps) {
  const editHref = `/coupons/${coupon._id}/edit`;

  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell className="pl-4">
        {permissions.canBulk && (
          <Checkbox
            aria-label={`Select ${coupon.title}`}
            checked={selected}
            onCheckedChange={onSelect}
          />
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40 text-muted-foreground">
            {coupon.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coupon.logo} alt="" className="size-full object-cover" />
            ) : (
              <TicketPercent aria-hidden className="size-4" />
            )}
          </div>
          <div>
            <div className="font-medium">{coupon.title}</div>
            <div className="font-mono text-xs text-muted-foreground">
              {coupon.couponCode}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>{formatDiscount(coupon, currency)}</TableCell>
      <TableCell className="hidden md:table-cell">
        {coupon.minimumAmount > 0 ? (
          formatMoney(coupon.minimumAmount, currency)
        ) : (
          <span className="text-muted-foreground">None</span>
        )}
      </TableCell>
      <TableCell className="hidden text-muted-foreground lg:table-cell">
        {coupon.startTime ? formatDate(coupon.startTime) : "Now"} –{" "}
        {formatDate(coupon.endTime)}
      </TableCell>
      <TableCell>
        <CouponStateBadge coupon={coupon} />
      </TableCell>
      <TableCell>
        <Switch
          aria-label="Showing"
          checked={coupon.status === "show"}
          disabled={!permissions.canPublish}
          onCheckedChange={onToggleStatus}
        />
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex justify-end gap-1">
          {permissions.canEdit && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Edit coupon"
              render={<Link href={editHref} />}
              nativeButton={false}
            >
              <Pencil />
            </Button>
          )}
          {permissions.canDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete coupon"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
