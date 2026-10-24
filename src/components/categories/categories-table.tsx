"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Eye,
  EyeOff,
  FolderInput,
  FolderTree,
  ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { BulkActionBar } from "@/components/layout/bulk-action-bar";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { TablePagination } from "@/components/layout/table-pagination";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/api-error";
import { reportBulkResult, toggleInSet } from "@/lib/bulk";
import { countDescendants, findPath } from "@/lib/categories";
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useBulkDeleteCategoriesMutation,
  useBulkUpdateCategoriesMutation,
  useDeleteCategoryMutation,
  useGetCategoryTreeQuery,
  useSetCategoryStatusMutation,
} from "@/store/api/category/api/categoryApi";
import type { CategoryNode, CategoryStatus } from "@/store/api/category/types";

import { MoveCategoriesDialog } from "./move-categories-dialog";

const ALL = "all";
const PAGE_SIZE = 10;
const COLUMNS = 6;

const STATUS_FILTERS = [
  { label: "All statuses", value: ALL },
  { label: "Showing", value: "show" },
  { label: "Hidden", value: "hide" },
];

type CategoriesTableProps = {
  parentId?: string;
};

export function CategoriesTable({ parentId }: CategoriesTableProps) {
  const { user: me } = useSession();
  const canAdd = can(me, "category", "can_add_category");
  const canEdit = can(me, "category", "can_edit_category");
  const canPublish = can(me, "category", "can_publish_category");
  const canDelete = can(me, "category", "can_delete_category");
  const canBulk = canEdit || canPublish || canDelete;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<CategoryNode | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const { data: tree = [], isFetching, isLoading, error } =
    useGetCategoryTreeQuery();
  const [setStatus] = useSetCategoryStatusMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();
  const [bulkUpdate, { isLoading: updating }] = useBulkUpdateCategoriesMutation();
  const [bulkDelete, { isLoading: bulkDeleting }] =
    useBulkDeleteCategoriesMutation();

  const path = parentId ? findPath(tree, parentId) : [];
  const parent = path.at(-1);
  const missingParent = Boolean(parentId) && !isLoading && !error && !parent;
  const level = parentId ? (parent?.children ?? []) : tree;

  const term = search.trim().toLowerCase();
  const filtered = level.filter(
    (node) =>
      (statusFilter === ALL || node.status === statusFilter) &&
      (!term ||
        node.name.toLowerCase().includes(term) ||
        node.slug.includes(term)),
  );
  const totalPage = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPage);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const selectedIds = [...selected];
  const allOnPageSelected =
    rows.length > 0 && rows.every((node) => selected.has(node._id));
  const someOnPageSelected = rows.some((node) => selected.has(node._id));

  const resetView = () => {
    setPage(1);
    setSelected(new Set());
  };

  const toggleAll = (checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      rows.forEach((node) =>
        checked ? next.add(node._id) : next.delete(node._id),
      );
      return next;
    });
  };

  const onToggleStatus = async (node: CategoryNode, show: boolean) => {
    try {
      await setStatus({ id: node._id, status: show ? "show" : "hide" }).unwrap();
      toast.success(`${node.name} is now ${show ? "showing" : "hidden"}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the status."));
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;

    try {
      const result = await deleteCategory(pendingDelete._id).unwrap();
      toast.success(
        result.deleted > 1
          ? `${pendingDelete.name} and ${result.deleted - 1} subcategories deleted.`
          : `${pendingDelete.name} deleted.`,
      );
      setSelected((current) => toggleInSet(current, pendingDelete._id, false));
      setPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the category."));
    }
  };

  const onBulkStatus = async (status: CategoryStatus) => {
    try {
      const result = await bulkUpdate({ ids: selectedIds, status }).unwrap();
      reportBulkResult(
        result,
        (count) => `${count} categor${count === 1 ? "y" : "ies"} ${status === "show" ? "shown" : "hidden"}.`,
      );
      setSelected(new Set());
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the categories."));
    }
  };

  const onBulkMove = async (target: string | null) => {
    try {
      const result = await bulkUpdate({
        ids: selectedIds,
        parentId: target,
      }).unwrap();
      reportBulkResult(
        result,
        (count) => `${count} categor${count === 1 ? "y" : "ies"} moved.`,
      );
      setSelected(new Set());
      setMoveOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not move the categories."));
    }
  };

  const onBulkDelete = async () => {
    try {
      const result = await bulkDelete(selectedIds).unwrap();
      reportBulkResult(
        result,
        (count) => `${count} categor${count === 1 ? "y" : "ies"} deleted.`,
      );
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the categories."));
    }
  };

  const newHref = parentId
    ? `/categories/new?parent=${parentId}`
    : "/categories/new";
  const pendingDeleteChildren = pendingDelete
    ? countDescendants(pendingDelete)
    : 0;

  return (
    <div className="w-full">
      {path.length > 0 && (
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/categories" />}>
                Categories
              </BreadcrumbLink>
            </BreadcrumbItem>
            {path.map((node, index) => (
              <span key={node._id} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === path.length - 1 ? (
                    <BreadcrumbPage>{node.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={<Link href={`/categories/${node._id}`} />}
                    >
                      {node.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <PageHeader
        title={parent ? parent.name : "Categories"}
        description={
          parent
            ? "Subcategories under this category. Open a row to go deeper."
            : "Top-level categories. Open a row to manage its subcategories."
        }
        actions={
          <>
            {parent && canEdit && (
              <Button
                variant="outline"
                render={<Link href={`/categories/${parent._id}/edit`} />}
                nativeButton={false}
              >
                <Pencil />
                Edit
              </Button>
            )}
            {canAdd && (
              <Button
                variant="outline"
                render={<Link href="/categories/import" />}
                nativeButton={false}
              >
                <Upload />
                Import
              </Button>
            )}
            {canAdd && !missingParent && (
              <Button render={<Link href={newHref} />} nativeButton={false}>
                <Plus />
                {parent ? "New subcategory" : "New category"}
              </Button>
            )}
          </>
        }
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row">
          <div className="relative flex-1 sm:max-w-sm">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetView();
              }}
              placeholder="Search name or slug"
              className="h-9 pl-9"
            />
          </div>

          <Select
            items={STATUS_FILTERS}
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value ?? ALL);
              resetView();
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <BulkActionBar
          count={selected.size}
          noun="category"
          onClear={() => setSelected(new Set())}
        >
          {canPublish && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() => onBulkStatus("show")}
              >
                <Eye />
                Show
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() => onBulkStatus("hide")}
              >
                <EyeOff />
                Hide
              </Button>
            </>
          )}
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => setMoveOpen(true)}
            >
              <FolderInput />
              Move
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
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
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Subcategories</TableHead>
              <TableHead>Showing</TableHead>
              <TableHead className="hidden lg:table-cell">Slug</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? "opacity-60" : ""}>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={COLUMNS} className="px-4">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && error && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS}
                  className="px-4 py-10 text-center text-destructive"
                >
                  {getErrorMessage(error, "Could not load categories.")}
                </TableCell>
              </TableRow>
            )}

            {missingParent && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS}
                  className="px-4 py-10 text-center text-destructive"
                >
                  Category not found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && !missingParent && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  {level.length === 0
                    ? parent
                      ? "No subcategories yet."
                      : "No categories yet."
                    : "No categories match your filters."}
                </TableCell>
              </TableRow>
            )}

            {rows.map((node) => (
              <TableRow
                key={node._id}
                data-state={selected.has(node._id) ? "selected" : undefined}
              >
                <TableCell className="pl-4">
                  {canBulk && (
                    <Checkbox
                      aria-label={`Select ${node.name}`}
                      checked={selected.has(node._id)}
                      onCheckedChange={(checked) =>
                        setSelected((current) =>
                          toggleInSet(current, node._id, checked),
                        )
                      }
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/categories/${node._id}`}
                    className="group flex items-center gap-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40 text-muted-foreground">
                      {node.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={node.icon}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageIcon aria-hidden className="size-4" />
                      )}
                    </div>
                    <span className="font-medium group-hover:underline">
                      {node.name}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Link
                    href={`/categories/${node._id}`}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    {node.children.length}
                    <ChevronRight aria-hidden className="size-3.5" />
                  </Link>
                </TableCell>
                <TableCell>
                  <Switch
                    aria-label="Showing"
                    checked={node.status === "show"}
                    disabled={!canPublish}
                    onCheckedChange={(checked) => onToggleStatus(node, checked)}
                  />
                </TableCell>
                <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                  {node.slug}
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Subcategories"
                      render={<Link href={`/categories/${node._id}`} />}
                      nativeButton={false}
                    >
                      <FolderTree />
                    </Button>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit category"
                        render={<Link href={`/categories/${node._id}/edit`} />}
                        nativeButton={false}
                      >
                        <Pencil />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete category"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setPendingDelete(node)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          pagination={{
            page: currentPage,
            limit: PAGE_SIZE,
            total: filtered.length,
            totalPage,
          }}
          onPageChange={setPage}
        />
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete category?"
        description={
          <>
            <strong>{pendingDelete?.name}</strong>
            {pendingDeleteChildren > 0 &&
              ` and its ${pendingDeleteChildren} subcategor${pendingDeleteChildren === 1 ? "y" : "ies"}`}{" "}
            will be removed. Products whose main category is removed are
            hidden from the store.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selected.size} categor${selected.size === 1 ? "y" : "ies"}?`}
        description="Their subcategories are removed too. Products whose main category is removed are hidden from the store."
        pending={bulkDeleting}
        onConfirm={onBulkDelete}
      />

      {moveOpen && (
        <MoveCategoriesDialog
          open={moveOpen}
          onOpenChange={setMoveOpen}
          ids={selectedIds}
          pending={updating}
          onConfirm={onBulkMove}
        />
      )}
    </div>
  );
}
