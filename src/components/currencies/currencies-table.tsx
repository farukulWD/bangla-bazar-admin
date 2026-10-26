"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { ALL, FilterSelect } from "@/components/layout/filter-select";
import { PageHeader } from "@/components/layout/page-header";
import { TablePagination } from "@/components/layout/table-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useDeleteCurrencyMutation,
  useGetCurrenciesQuery,
  useSetBaseCurrencyMutation,
  useSetCurrencyStatusMutation,
} from "@/store/api/currency/api/currencyApi";
import type { Currency, CurrencyStatus } from "@/store/api/currency/types";
import { useGetPublicSettingsQuery } from "@/store/api/settings/api/settingsApi";

import { CurrencyRow } from "./currency-row";

const COLUMNS = 6;

const STATUS_FILTERS = [
  { label: "All statuses", value: ALL },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

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

export function CurrenciesTable() {
  const { user: me } = useSession();
  const canAdd = can(me, "currency", "can_add_currency");
  const permissions = {
    canEdit: can(me, "currency", "can_edit_currency"),
    canPublish: can(me, "currency", "can_publish_currency"),
    canSetBase: can(me, "currency", "can_set_base_currency"),
    canDelete: can(me, "currency", "can_delete_currency"),
  };

  const { data: settings } = useGetPublicSettingsQuery();
  const baseCode = settings?.store?.currencyCode ?? "BDT";

  const [search, setSearch] = useState("");
  const [status, setStatusFilter] = useState(ALL);
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Currency | null>(null);
  const [pendingBase, setPendingBase] = useState<Currency | null>(null);
  const searchTerm = useDebouncedValue(search.trim());

  const { data, isFetching, isLoading, error } = useGetCurrenciesQuery({
    searchTerm: searchTerm || undefined,
    status: status === ALL ? undefined : (status as CurrencyStatus),
    page,
    limit: 10,
    sort: "-isBase code",
  });
  const [setStatus] = useSetCurrencyStatusMutation();
  const [setBase, { isLoading: settingBase }] = useSetBaseCurrencyMutation();
  const [deleteCurrency, { isLoading: deleting }] = useDeleteCurrencyMutation();

  const currencies = data?.data ?? [];

  const onToggleStatus = async (currency: Currency, active: boolean) => {
    try {
      await setStatus({ id: currency._id, status: active ? "active" : "inactive" }).unwrap();
      toast.success(`${currency.code} is now ${active ? "active" : "inactive"}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the status."));
    }
  };

  const onSetBase = async () => {
    if (!pendingBase) return;

    try {
      await setBase(pendingBase._id).unwrap();
      toast.success(`${pendingBase.code} is now the base currency.`);
      setPendingBase(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the base currency."));
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteCurrency(pendingDelete._id).unwrap();
      toast.success(`${pendingDelete.code} deleted.`);
      setPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the currency."));
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Currencies"
        description="Currencies shoppers can view prices in, quoted against the base currency."
        actions={
          canAdd && (
            <Button render={<Link href="/currencies/new" />} nativeButton={false}>
              <Plus />
              New currency
            </Button>
          )
        }
      />

      <Card className="gap-0 overflow-clip py-0">
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search code or name"
              className="h-9 pl-9"
            />
          </div>
          <FilterSelect
            items={STATUS_FILTERS}
            value={status}
            onChange={(next) => {
              setStatusFilter(next);
              setPage(1);
            }}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Currency</TableHead>
              <TableHead className="hidden md:table-cell">Format</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead className="hidden lg:table-cell">Rate updated</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? "opacity-60" : ""}>
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={COLUMNS} className="px-4">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && error && (
              <MessageRow error>
                {getErrorMessage(error, "Could not load currencies.")}
              </MessageRow>
            )}

            {!isLoading && !error && currencies.length === 0 && (
              <MessageRow>No currencies found.</MessageRow>
            )}

            {currencies.map((currency) => (
              <CurrencyRow
                key={currency._id}
                currency={currency}
                baseCode={baseCode}
                permissions={permissions}
                onToggleStatus={(active) => onToggleStatus(currency, active)}
                onSetBase={() => setPendingBase(currency)}
                onDelete={() => setPendingDelete(currency)}
              />
            ))}
          </TableBody>
        </Table>

        <TablePagination pagination={data?.pagination} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={Boolean(pendingBase)}
        onOpenChange={(open) => !open && setPendingBase(null)}
        title="Change the base currency?"
        description={
          <>
            <strong>{pendingBase?.code}</strong> becomes the currency the shop prices in.
            Every other rate is re-quoted against it, and the store settings switch to{" "}
            {pendingBase?.code}. Existing product prices are not converted.
          </>
        }
        confirmLabel={`Make ${pendingBase?.code ?? ""} base`}
        pending={settingBase}
        onConfirm={onSetBase}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete currency?"
        description={
          <>
            Shoppers will no longer be able to view prices in{" "}
            <strong>{pendingDelete?.code}</strong>.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
