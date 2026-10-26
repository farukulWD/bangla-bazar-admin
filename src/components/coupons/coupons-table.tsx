"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { ALL } from "@/components/layout/filter-select";
import { PageHeader } from "@/components/layout/page-header";
import { TablePagination } from "@/components/layout/table-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api-error";
import { toggleInSet } from "@/lib/bulk";
import { endOfDay, startOfDay } from "@/lib/coupons";
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useDeleteCouponMutation,
  useGetCouponsQuery,
  useSetCouponStatusMutation,
} from "@/store/api/coupon/api/couponApi";
import type { Coupon, CouponStatus } from "@/store/api/coupon/types";
import { useGetPublicSettingsQuery } from "@/store/api/settings/api/settingsApi";

import { CouponBulkActions } from "./coupon-bulk-actions";
import {
  CouponFilters,
  EMPTY_COUPON_FILTERS,
  type CouponFilterValues,
} from "./coupon-filters";
import { CouponRow } from "./coupon-row";

const COLUMNS = 8;

function MessageRow({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <TableRow>
      <TableCell
        colSpan={COLUMNS}
        className={cn(
          "px-4 py-10 text-center",
          error ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {children}
      </TableCell>
    </TableRow>
  );
}

export function CouponsTable() {
  const { user: me } = useSession();
  const canAdd = can(me, "coupon", "can_add_coupon");
  const canEdit = can(me, "coupon", "can_edit_coupon");
  const canPublish = can(me, "coupon", "can_publish_coupon");
  const canDelete = can(me, "coupon", "can_delete_coupon");
  const permissions = { canBulk: canPublish || canDelete, canEdit, canPublish, canDelete };

  const { data: settings } = useGetPublicSettingsQuery();
  const currency = settings?.store?.currencySymbol ?? "৳";

  const [filters, setFilters] = useState<CouponFilterValues>(EMPTY_COUPON_FILTERS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Coupon | null>(null);
  const searchTerm = useDebouncedValue(filters.search.trim());

  const { data, isFetching, isLoading, error } = useGetCouponsQuery({
    searchTerm: searchTerm || undefined,
    status: filters.status === ALL ? undefined : (filters.status as CouponStatus),
    from: startOfDay(filters.from),
    to: endOfDay(filters.to),
    page,
    limit: 10,
    sort: "-createdAt",
  });
  const [setStatus] = useSetCouponStatusMutation();
  const [deleteCoupon, { isLoading: deleting }] = useDeleteCouponMutation();

  const coupons = data?.data ?? [];
  const allOnPageSelected =
    coupons.length > 0 && coupons.every((coupon) => selected.has(coupon._id));
  const someOnPageSelected = coupons.some((coupon) => selected.has(coupon._id));

  const onFilterChange = (change: Partial<CouponFilterValues>) => {
    setFilters((current) => ({ ...current, ...change }));
    setPage(1);
    setSelected(new Set());
  };

  const toggleAll = (checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      coupons.forEach((coupon) =>
        checked ? next.add(coupon._id) : next.delete(coupon._id),
      );
      return next;
    });
  };

  const onToggleStatus = async (coupon: Coupon, show: boolean) => {
    try {
      await setStatus({ id: coupon._id, status: show ? "show" : "hide" }).unwrap();
      toast.success(`${coupon.couponCode} is now ${show ? "showing" : "hidden"}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the status."));
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteCoupon(pendingDelete._id).unwrap();
      toast.success(`${pendingDelete.couponCode} deleted.`);
      setSelected((current) => toggleInSet(current, pendingDelete._id, false));
      setPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the coupon."));
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Coupons"
        description="Discount codes shoppers can apply at checkout."
        actions={
          canAdd && (
            <>
              <Button
                variant="outline"
                render={<Link href="/coupons/import" />}
                nativeButton={false}
              >
                <Upload />
                Import
              </Button>
              <Button render={<Link href="/coupons/new" />} nativeButton={false}>
                <Plus />
                New coupon
              </Button>
            </>
          )
        }
      />

      <Card className="gap-0 overflow-clip py-0">
        <CouponFilters values={filters} onChange={onFilterChange} />

        <CouponBulkActions
          selectedIds={[...selected]}
          canPublish={canPublish}
          canDelete={canDelete}
          onClear={() => setSelected(new Set())}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 pl-4">
                {permissions.canBulk && (
                  <Checkbox
                    aria-label="Select all on this page"
                    checked={allOnPageSelected}
                    indeterminate={someOnPageSelected && !allOnPageSelected}
                    onCheckedChange={toggleAll}
                  />
                )}
              </TableHead>
              <TableHead>Coupon</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead className="hidden md:table-cell">Min. spend</TableHead>
              <TableHead className="hidden lg:table-cell">Valid</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Showing</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? "opacity-60" : ""}>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={COLUMNS} className="px-4">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && error && (
              <MessageRow error>
                {getErrorMessage(error, "Could not load coupons.")}
              </MessageRow>
            )}

            {!isLoading && !error && coupons.length === 0 && (
              <MessageRow>No coupons found.</MessageRow>
            )}

            {coupons.map((coupon) => (
              <CouponRow
                key={coupon._id}
                coupon={coupon}
                currency={currency}
                selected={selected.has(coupon._id)}
                permissions={permissions}
                onSelect={(checked) =>
                  setSelected((current) => toggleInSet(current, coupon._id, checked))
                }
                onToggleStatus={(show) => onToggleStatus(coupon, show)}
                onDelete={() => setPendingDelete(coupon)}
              />
            ))}
          </TableBody>
        </Table>

        <TablePagination pagination={data?.pagination} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete coupon?"
        description={
          <>
            Shoppers will no longer be able to use{" "}
            <strong>{pendingDelete?.couponCode}</strong>.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
