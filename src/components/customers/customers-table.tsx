"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "cn";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { download } from "@/components/import/bulk-import";
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
import { useGetPublicSettingsQuery } from "@/store/api/settings/api/settingsApi";
import {
  useExportCustomersMutation,
  useGetCustomersQuery,
} from "@/store/api/user/api/userApi";
import type { Customer, CustomerFilterQuery } from "@/store/api/user/types";

import { CustomerBulkActions } from "./customer-bulk-actions";
import {
  CustomerFilters,
  readCustomerFilters,
  type CustomerFilterValues,
} from "./customer-filters";
import { CustomerRow } from "./customer-row";
import { useCustomerActions } from "./use-customer-actions";

const COLUMNS = 9;

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

export function CustomersTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlFilters = readCustomerFilters(searchParams);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const { permissions, setStatus, deleteCustomer, deleting } = useCustomerActions();
  const canBulk = permissions.canToggle || permissions.canDelete;

  const { data: settings } = useGetPublicSettingsQuery();
  const currency = settings?.store?.currencySymbol ?? "৳";

  const [search, setSearch] = useState(urlFilters.search);
  const [syncedSearch, setSyncedSearch] = useState(urlFilters.search);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  if (urlFilters.search !== syncedSearch) {
    setSyncedSearch(urlFilters.search);
    setSelected(new Set());
    if (urlFilters.search !== search.trim()) setSearch(urlFilters.search);
  }

  const filters: CustomerFilterValues = { ...urlFilters, search };

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

  const query: CustomerFilterQuery = {
    searchTerm: urlFilters.search || undefined,
    isActive: filters.status === ALL ? undefined : filters.status === "active",
    from: startOfDay(filters.from),
    to: endOfDay(filters.to),
  };

  const { data, isFetching, isLoading, error } = useGetCustomersQuery({
    ...query,
    page,
    limit: 10,
    sort: "-createdAt",
  });
  const [exportCustomers, { isLoading: exporting }] = useExportCustomersMutation();

  const customers = data?.data ?? [];
  const allOnPageSelected =
    customers.length > 0 && customers.every((customer) => selected.has(customer._id));
  const someOnPageSelected = customers.some((customer) => selected.has(customer._id));

  const onFilterChange = ({ search: nextSearch, ...change }: Partial<CustomerFilterValues>) => {
    if (nextSearch !== undefined) setSearch(nextSearch);
    if (Object.keys(change).length > 0) {
      setParams({ ...change, page: undefined });
      setSelected(new Set());
    }
  };

  const setPage = (next: number) =>
    setParams({ page: next > 1 ? String(next) : undefined });

  const toggleAll = (checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      customers.forEach((customer) =>
        checked ? next.add(customer._id) : next.delete(customer._id),
      );
      return next;
    });
  };

  const onExport = async () => {
    try {
      const blob = await exportCustomers(query).unwrap();
      download(`customers-${new Date().toISOString().slice(0, 10)}.csv`, blob, "text/csv");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not export customers."));
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;
    if (await deleteCustomer(pendingDelete)) {
      setSelected((current) => toggleInSet(current, pendingDelete._id, false));
      setPendingDelete(null);
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Customers"
        description="Everyone who has signed up to shop in the store."
        actions={
          <Button variant="outline" disabled={exporting} onClick={onExport}>
            {exporting ? <Loader2 className="animate-spin" /> : <Download />}
            Export CSV
          </Button>
        }
      />

      <Card className="gap-0 overflow-clip py-0">
        <CustomerFilters values={filters} onChange={onFilterChange} />

        <CustomerBulkActions
          selectedIds={[...selected]}
          canToggle={permissions.canToggle}
          canDelete={permissions.canDelete}
          onClear={() => setSelected(new Set())}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 pl-4">
                {canBulk && (
                  <Checkbox
                    aria-label="Select all on this page"
                    checked={allOnPageSelected}
                    indeterminate={someOnPageSelected && !allOnPageSelected}
                    onCheckedChange={toggleAll}
                  />
                )}
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead className="hidden xl:table-cell">Last order</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
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
              <MessageRow error>{getErrorMessage(error, "Could not load customers.")}</MessageRow>
            )}

            {!isLoading && !error && customers.length === 0 && (
              <MessageRow>No customers found.</MessageRow>
            )}

            {customers.map((customer) => (
              <CustomerRow
                key={customer._id}
                customer={customer}
                currency={currency}
                selected={selected.has(customer._id)}
                selectable={canBulk}
                permissions={permissions}
                onSelect={(checked) =>
                  setSelected((current) => toggleInSet(current, customer._id, checked))
                }
                onToggleStatus={() =>
                  setStatus(customer, customer.status === "active" ? "inactive" : "active")
                }
                onDelete={() => setPendingDelete(customer)}
              />
            ))}
          </TableBody>
        </Table>

        <TablePagination pagination={data?.pagination} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete customer?"
        description={
          <>
            <strong>{pendingDelete?.name}</strong> will be deactivated and removed from this
            list. Their past orders are kept.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
