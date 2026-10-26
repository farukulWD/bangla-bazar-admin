"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "cn";
import { Check, Trash2, X } from "lucide-react";

import { BulkActionBar } from "@/components/layout/bulk-action-bar";
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
import { useGetReviewsQuery } from "@/store/api/review/api/reviewApi";
import type { ReviewStatus } from "@/store/api/review/types";
import type { ID } from "@/types/api";

import { RejectDialog } from "./reject-dialog";
import { ReviewDetail } from "./review-detail";
import { ReviewFilters, readReviewFilters, type ReviewFilterValues } from "./review-filters";
import { ReviewRow } from "./review-row";
import { useReviewActions } from "./use-review-actions";

const COLUMNS = 7;

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

export function ReviewsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlFilters = readReviewFilters(searchParams);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const openId = searchParams.get("id");

  const {
    permissions,
    setStatus,
    setStatusMany,
    saveReply,
    deleteReview,
    deleteMany,
    updatingStatus,
    replying,
    deleting,
  } = useReviewActions();
  const canBulk = permissions.canEdit || permissions.canDelete;

  const [search, setSearch] = useState(urlFilters.search);
  const [syncedSearch, setSyncedSearch] = useState(urlFilters.search);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectIds, setRejectIds] = useState<ID[]>([]);
  const [deleteIds, setDeleteIds] = useState<ID[]>([]);
  const debouncedSearch = useDebouncedValue(search.trim());

  if (urlFilters.search !== syncedSearch) {
    setSyncedSearch(urlFilters.search);
    if (urlFilters.search !== search.trim()) setSearch(urlFilters.search);
  }

  const filters: ReviewFilterValues = { ...urlFilters, search };

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

  const { data, isFetching, isLoading, error } = useGetReviewsQuery({
    searchTerm: urlFilters.search || undefined,
    status: filters.status === ALL ? undefined : (filters.status as ReviewStatus),
    rating: filters.rating === ALL ? undefined : filters.rating,
    page,
    limit: 10,
    sort: "-createdAt",
  });

  const reviews = data?.data ?? [];
  const selectedIds = [...selected];
  const allOnPageSelected =
    reviews.length > 0 && reviews.every((review) => selected.has(review._id));
  const someOnPageSelected = reviews.some((review) => selected.has(review._id));

  const onFilterChange = ({ search: nextSearch, ...change }: Partial<ReviewFilterValues>) => {
    if (nextSearch !== undefined) {
      setSearch(nextSearch);
      setSelected(new Set());
    }
    if (Object.keys(change).length > 0) {
      setParams({ ...change, page: undefined });
      setSelected(new Set());
    }
  };

  const setPage = (next: number) => setParams({ page: next > 1 ? String(next) : undefined });

  const openReview = (id: ID | undefined) => setParams({ id });

  const toggleAll = (checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      reviews.forEach((review) => (checked ? next.add(review._id) : next.delete(review._id)));
      return next;
    });
  };

  const forget = (ids: ID[]) =>
    setSelected((current) => ids.reduce((next, id) => toggleInSet(next, id, false), current));

  const approve = async (ids: ID[]) => {
    const done =
      ids.length === 1 ? await setStatus(ids[0], "approved") : await setStatusMany(ids, "approved");
    if (done) forget(ids);
  };

  const onReject = async (reason: string) => {
    const done =
      rejectIds.length === 1
        ? await setStatus(rejectIds[0], "rejected", reason)
        : await setStatusMany(rejectIds, "rejected", reason);
    if (done) {
      forget(rejectIds);
      setRejectIds([]);
    }
  };

  const onDelete = async () => {
    const done =
      deleteIds.length === 1 ? await deleteReview(deleteIds[0]) : await deleteMany(deleteIds);
    if (done) {
      forget(deleteIds);
      if (openId && deleteIds.includes(openId)) openReview(undefined);
      setDeleteIds([]);
    }
  };

  return (
    <div className="w-full">
      <PageHeader title="Reviews" description="Approve, reject and reply to product reviews." />

      <Card className="gap-0 overflow-clip py-0">
        <ReviewFilters values={filters} onChange={onFilterChange} />

        <BulkActionBar count={selected.size} noun="review" onClear={() => setSelected(new Set())}>
          {permissions.canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={updatingStatus}
                onClick={() => approve(selectedIds)}
              >
                <Check />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={updatingStatus}
                onClick={() => setRejectIds(selectedIds)}
              >
                <X />
                Reject
              </Button>
            </>
          )}
          {permissions.canDelete && (
            <Button variant="destructive" size="sm" onClick={() => setDeleteIds(selectedIds)}>
              <Trash2 />
              Delete
            </Button>
          )}
        </BulkActionBar>

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
              <TableHead>Product</TableHead>
              <TableHead className="hidden lg:table-cell">Customer</TableHead>
              <TableHead>Review</TableHead>
              <TableHead className="hidden md:table-cell">Submitted</TableHead>
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
              <MessageRow error>{getErrorMessage(error, "Could not load reviews.")}</MessageRow>
            )}

            {!isLoading && !error && reviews.length === 0 && (
              <MessageRow>No reviews found.</MessageRow>
            )}

            {reviews.map((review) => (
              <ReviewRow
                key={review._id}
                review={review}
                permissions={permissions}
                selectable={canBulk}
                selected={selected.has(review._id)}
                onSelect={(checked) =>
                  setSelected((current) => toggleInSet(current, review._id, checked))
                }
                onOpen={() => openReview(review._id)}
                onApprove={() => approve([review._id])}
                onReject={() => setRejectIds([review._id])}
                onDelete={() => setDeleteIds([review._id])}
              />
            ))}
          </TableBody>
        </Table>

        <TablePagination pagination={data?.pagination} onPageChange={setPage} />
      </Card>

      <ReviewDetail
        id={openId}
        permissions={permissions}
        replying={replying}
        updatingStatus={updatingStatus}
        onClose={() => openReview(undefined)}
        onApprove={(review) => approve([review._id])}
        onReject={(review) => setRejectIds([review._id])}
        onSaveReply={saveReply}
      />

      <RejectDialog
        open={rejectIds.length > 0}
        count={rejectIds.length}
        pending={updatingStatus}
        onOpenChange={(open) => !open && setRejectIds([])}
        onConfirm={onReject}
      />

      <ConfirmDialog
        open={deleteIds.length > 0}
        onOpenChange={(open) => !open && setDeleteIds([])}
        title={deleteIds.length === 1 ? "Delete review?" : `Delete ${deleteIds.length} reviews?`}
        description="Deleted reviews are removed from the store and the product rating is updated. This cannot be undone."
        pending={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
