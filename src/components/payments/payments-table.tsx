"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "cn";
import { X } from "lucide-react";

import { ALL } from "@/components/layout/filter-select";
import { PageHeader } from "@/components/layout/page-header";
import { TablePagination } from "@/components/layout/table-pagination";
import { Badge } from "@/components/ui/badge";
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
import { useGetPaymentsQuery } from "@/store/api/payment/api/paymentApi";
import type { PaymentState } from "@/store/api/payment/types";

import { PaymentFilters, readPaymentFilters, type PaymentFilterValues } from "./payment-filters";
import { PaymentRow } from "./payment-row";

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

function ScopeChip({
  label,
  name,
  clearLabel,
  onClear,
}: {
  label: string;
  name: string;
  clearLabel: string;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b px-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant="secondary" className="gap-1 pr-1">
        {name}
        <button
          type="button"
          aria-label={clearLabel}
          onClick={onClear}
          className="rounded-full p-0.5 hover:bg-background/60"
        >
          <X className="size-3" />
        </button>
      </Badge>
    </div>
  );
}

export function PaymentsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlFilters = readPaymentFilters(searchParams);
  const orderId = searchParams.get("orderId") ?? undefined;
  const userId = searchParams.get("userId") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [search, setSearch] = useState(urlFilters.search);
  const [syncedSearch, setSyncedSearch] = useState(urlFilters.search);
  const debouncedSearch = useDebouncedValue(search.trim());

  if (urlFilters.search !== syncedSearch) {
    setSyncedSearch(urlFilters.search);
    if (urlFilters.search !== search.trim()) setSearch(urlFilters.search);
  }

  const filters: PaymentFilterValues = { ...urlFilters, search };

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

  const { data, isFetching, isLoading, error } = useGetPaymentsQuery({
    searchTerm: urlFilters.search || undefined,
    status: pick<PaymentState>(filters.status),
    orderId,
    userId,
    from: startOfDay(filters.from),
    to: endOfDay(filters.to),
    page,
    limit: 10,
    sort: "-createdAt",
  });

  const payments = data?.data ?? [];
  const first = payments[0];

  const onFilterChange = ({ search: nextSearch, ...change }: Partial<PaymentFilterValues>) => {
    if (nextSearch !== undefined) setSearch(nextSearch);
    if (Object.keys(change).length > 0) setParams({ ...change, page: undefined });
  };

  const setPage = (next: number) =>
    setParams({ page: next > 1 ? String(next) : undefined });

  return (
    <div className="w-full">
      <PageHeader title="Payments" description="Every online payment attempt made at checkout." />

      <Card className="gap-0 overflow-clip py-0">
        <PaymentFilters values={filters} onChange={onFilterChange} />

        {orderId && (
          <ScopeChip
            label="Showing payments for"
            name={first ? `Order #${first.invoice}` : "this order"}
            clearLabel="Show all orders"
            onClear={() => setParams({ orderId: undefined, page: undefined })}
          />
        )}

        {userId && (
          <ScopeChip
            label="Showing payments by"
            name={first?.user?.name ?? "this customer"}
            clearLabel="Show all customers"
            onClear={() => setParams({ userId: undefined, page: undefined })}
          />
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Transaction</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden lg:table-cell">Card</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
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
              <MessageRow error>{getErrorMessage(error, "Could not load payments.")}</MessageRow>
            )}

            {!isLoading && !error && payments.length === 0 && (
              <MessageRow>No payments found.</MessageRow>
            )}

            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </TableBody>
        </Table>

        <TablePagination pagination={data?.pagination} onPageChange={setPage} />
      </Card>
    </div>
  );
}
