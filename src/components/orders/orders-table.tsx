"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "cn";
import { Download, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { download } from "@/components/import/bulk-import";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { ALL } from "@/components/layout/filter-select";
import { PageHeader } from "@/components/layout/page-header";
import { TablePagination } from "@/components/layout/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { endOfDay, startOfDay } from "@/lib/coupons";
import { useExportOrdersMutation, useGetOrdersQuery } from "@/store/api/order/api/orderApi";
import type {
  Order,
  OrderFilterQuery,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/store/api/order/types";

import { OrderFilters, readOrderFilters, type OrderFilterValues } from "./order-filters";
import { OrderRow } from "./order-row";
import { OrderStatCards } from "./order-stat-cards";
import { useOrderActions } from "./use-order-actions";

const COLUMNS = 8;

const pick = <T extends string>(value: string) => (value === ALL ? undefined : (value as T));

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

export function OrdersTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlFilters = readOrderFilters(searchParams);
  const userId = searchParams.get("userId") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const { permissions, setStatus, cancelOrder, cancelling } = useOrderActions();

  const [search, setSearch] = useState(urlFilters.search);
  const [syncedSearch, setSyncedSearch] = useState(urlFilters.search);
  const [pendingCancel, setPendingCancel] = useState<Order | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  if (urlFilters.search !== syncedSearch) {
    setSyncedSearch(urlFilters.search);
    if (urlFilters.search !== search.trim()) setSearch(urlFilters.search);
  }

  const filters: OrderFilterValues = { ...urlFilters, search };

  const setParams = useCallback(
    (change: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(change)) {
        if (!value || value === ALL) next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (debouncedSearch !== search.trim() || debouncedSearch === urlFilters.search) return;
    setParams({ q: debouncedSearch, page: undefined });
  }, [debouncedSearch, search, urlFilters.search, setParams]);

  const query: OrderFilterQuery = {
    searchTerm: urlFilters.search || undefined,
    status: pick<OrderStatus>(filters.status),
    paymentStatus: pick<PaymentStatus>(filters.paymentStatus),
    paymentMethod: pick<PaymentMethod>(filters.paymentMethod),
    userId,
    from: startOfDay(filters.from),
    to: endOfDay(filters.to),
  };

  const { data, isFetching, isLoading, error } = useGetOrdersQuery({
    ...query,
    page,
    limit: 10,
    sort: "-createdAt",
  });
  const [exportOrders, { isLoading: exporting }] = useExportOrdersMutation();

  const orders = data?.data ?? [];
  const customerName = orders[0]?.user?.name;

  const onFilterChange = ({ search: nextSearch, ...change }: Partial<OrderFilterValues>) => {
    if (nextSearch !== undefined) setSearch(nextSearch);
    if (Object.keys(change).length > 0) setParams({ ...change, page: undefined });
  };

  const setPage = (next: number) =>
    setParams({ page: next > 1 ? String(next) : undefined });

  const clearCustomer = () => setParams({ userId: undefined, page: undefined });

  const onExport = async () => {
    try {
      const blob = await exportOrders(query).unwrap();
      download(`orders-${new Date().toISOString().slice(0, 10)}.csv`, blob, "text/csv");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not export orders."));
    }
  };

  const onCancel = async () => {
    if (!pendingCancel) return;
    if (await cancelOrder(pendingCancel)) setPendingCancel(null);
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Orders"
        description="Every order placed in the store."
        actions={
          <Button variant="outline" disabled={exporting} onClick={onExport}>
            {exporting ? <Loader2 className="animate-spin" /> : <Download />}
            Export CSV
          </Button>
        }
      />

      <OrderStatCards
        active={filters.status}
        onSelect={(status) => onFilterChange({ status })}
      />

      <Card className="gap-0 overflow-clip py-0">
        <OrderFilters values={filters} onChange={onFilterChange} />

        {userId && (
          <div className="flex items-center gap-2 border-b px-4 py-2 text-sm">
            <span className="text-muted-foreground">Showing orders for</span>
            <Badge variant="secondary" className="gap-1 pr-1">
              {customerName ?? "this customer"}
              <button
                type="button"
                aria-label="Show all customers"
                onClick={clearCustomer}
                className="rounded-full p-0.5 hover:bg-background/60"
              >
                <X className="size-3" />
              </button>
            </Badge>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Placed</TableHead>
              <TableHead className="hidden lg:table-cell">Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="hidden lg:table-cell">Payment</TableHead>
              <TableHead>Status</TableHead>
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
              <MessageRow error>{getErrorMessage(error, "Could not load orders.")}</MessageRow>
            )}

            {!isLoading && !error && orders.length === 0 && (
              <MessageRow>No orders found.</MessageRow>
            )}

            {orders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                permissions={permissions}
                onSetStatus={(status) => setStatus(order, status)}
                onCancel={() => setPendingCancel(order)}
              />
            ))}
          </TableBody>
        </Table>

        <TablePagination pagination={data?.pagination} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        onOpenChange={(open) => !open && setPendingCancel(null)}
        title="Cancel order?"
        description={
          <>
            Order <strong>#{pendingCancel?.invoice}</strong> will be cancelled and its stock
            returned. This cannot be undone.
          </>
        }
        confirmLabel="Cancel order"
        pending={cancelling}
        onConfirm={onCancel}
      />
    </div>
  );
}
