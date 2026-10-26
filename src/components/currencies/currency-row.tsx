import Link from "next/link";
import { Pencil, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/coupons";
import { formatCurrencyAmount, formatRate } from "@/lib/currencies";
import type { Currency } from "@/store/api/currency/types";

import { CurrencyRatePopover } from "./currency-rate-popover";

export type CurrencyRowPermissions = {
  canEdit: boolean;
  canPublish: boolean;
  canSetBase: boolean;
  canDelete: boolean;
};

type CurrencyRowProps = {
  currency: Currency;
  baseCode: string;
  permissions: CurrencyRowPermissions;
  onToggleStatus: (active: boolean) => void;
  onSetBase: () => void;
  onDelete: () => void;
};

export function CurrencyRow({
  currency,
  baseCode,
  permissions,
  onToggleStatus,
  onSetBase,
  onDelete,
}: CurrencyRowProps) {
  const editHref = `/currencies/${currency._id}/edit`;

  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 font-medium">
            {currency.symbol}
          </div>
          <div>
            <div className="flex items-center gap-2 font-medium">
              <span className="font-mono">{currency.code}</span>
              {currency.isBase && <Badge>Base</Badge>}
            </div>
            <div className="text-xs text-muted-foreground">{currency.name}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {formatCurrencyAmount(1234.5, currency)}
      </TableCell>
      <TableCell>
        {currency.isBase ? (
          <span className="text-muted-foreground">1 (base)</span>
        ) : (
          <div>
            <div className="flex items-center gap-1">
              <span className="tabular-nums">{formatRate(currency.rate)}</span>
              {permissions.canEdit && (
                <CurrencyRatePopover currency={currency} baseCode={baseCode} />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              per 1 {baseCode}
            </div>
          </div>
        )}
      </TableCell>
      <TableCell className="hidden text-muted-foreground lg:table-cell">
        {formatDate(currency.rateUpdatedAt)}
      </TableCell>
      <TableCell>
        <Switch
          aria-label="Active"
          checked={currency.status === "active"}
          disabled={currency.isBase || !permissions.canPublish}
          onCheckedChange={onToggleStatus}
        />
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex justify-end gap-1">
          {permissions.canSetBase && !currency.isBase && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Make ${currency.code} the base currency`}
              title="Make base currency"
              onClick={onSetBase}
            >
              <Star />
            </Button>
          )}
          {permissions.canEdit && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Edit currency"
              render={<Link href={editHref} />}
              nativeButton={false}
            >
              <Pencil />
            </Button>
          )}
          {permissions.canDelete && !currency.isBase && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete currency"
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
