"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "cn";

import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { ALL } from "@/components/layout/filter-select";
import { PageHeader } from "@/components/layout/page-header";
import { TablePagination } from "@/components/layout/table-pagination";
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
import { useGetContactsQuery } from "@/store/api/contact/api/contactApi";
import type { Contact, ContactStatus } from "@/store/api/contact/types";

import {
  ContactFilters,
  readContactFilters,
  type ContactFilterValues,
} from "./contact-filters";
import { ContactRow } from "./contact-row";
import { useContactActions } from "./use-contact-actions";

const COLUMNS = 5;

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

export function ContactsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlFilters = readContactFilters(searchParams);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const { permissions, setStatus, deleteContact, deleting } = useContactActions();

  const [search, setSearch] = useState(urlFilters.search);
  const [syncedSearch, setSyncedSearch] = useState(urlFilters.search);
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  if (urlFilters.search !== syncedSearch) {
    setSyncedSearch(urlFilters.search);
    if (urlFilters.search !== search.trim()) setSearch(urlFilters.search);
  }

  const filters: ContactFilterValues = { ...urlFilters, search };

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

  const { data, isFetching, isLoading, error } = useGetContactsQuery({
    searchTerm: urlFilters.search || undefined,
    status: filters.status === ALL ? undefined : (filters.status as ContactStatus),
    page,
    limit: 10,
    sort: "-createdAt",
  });

  const contacts = data?.data ?? [];

  const onFilterChange = ({ search: nextSearch, ...change }: Partial<ContactFilterValues>) => {
    if (nextSearch !== undefined) setSearch(nextSearch);
    if (Object.keys(change).length > 0) setParams({ ...change, page: undefined });
  };

  const setPage = (next: number) =>
    setParams({ page: next > 1 ? String(next) : undefined });

  const onDelete = async () => {
    if (!pendingDelete) return;
    if (await deleteContact(pendingDelete)) setPendingDelete(null);
  };

  return (
    <div className="w-full">
      <PageHeader title="Messages" description="Messages sent from the store contact form." />

      <Card className="gap-0 overflow-clip py-0">
        <ContactFilters values={filters} onChange={onFilterChange} />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="hidden md:table-cell">Received</TableHead>
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
              <MessageRow error>{getErrorMessage(error, "Could not load messages.")}</MessageRow>
            )}

            {!isLoading && !error && contacts.length === 0 && (
              <MessageRow>No messages found.</MessageRow>
            )}

            {contacts.map((contact) => (
              <ContactRow
                key={contact._id}
                contact={contact}
                permissions={permissions}
                onSetStatus={(status) => setStatus(contact, status)}
                onDelete={() => setPendingDelete(contact)}
              />
            ))}
          </TableBody>
        </Table>

        <TablePagination pagination={data?.pagination} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete message?"
        description={
          <>
            The message from <strong>{pendingDelete?.name}</strong> will be permanently
            deleted. This cannot be undone.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
