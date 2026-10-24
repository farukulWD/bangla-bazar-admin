"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ListTree,
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
import { Badge } from "@/components/ui/badge";
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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api-error";
import { reportBulkResult, toggleInSet } from "@/lib/bulk";
import { can } from "@/lib/permissions";
import {
  ATTRIBUTE_OPTIONS,
  ATTRIBUTE_TYPES,
} from "@/lib/validation/attribute-schemas";
import {
  useBulkDeleteAttributesMutation,
  useBulkUpdateAttributesMutation,
  useDeleteAttributeMutation,
  useGetAttributesQuery,
  useSetAttributeStatusMutation,
} from "@/store/api/attribute/api/attributeApi";
import type {
  Attribute,
  AttributeBulkUpdatePayload,
  AttributeOption,
  AttributeStatus,
  AttributeType,
} from "@/store/api/attribute/types";
import { useSession } from "@/store/api/auth/hooks/use-session";

const ALL = "all";
const COLUMNS = 7;
const PREVIEW_VALUES = 4;

const OPTION_FILTERS = [{ label: "All inputs", value: ALL }, ...ATTRIBUTE_OPTIONS];
const TYPE_FILTERS = [{ label: "All types", value: ALL }, ...ATTRIBUTE_TYPES];
const STATUS_FILTERS = [
  { label: "All statuses", value: ALL },
  { label: "Showing", value: "show" },
  { label: "Hidden", value: "hide" },
];

const labelOf = (
  options: readonly { label: string; value: string }[],
  value: string,
) => options.find((option) => option.value === value)?.label ?? value;

type FilterSelectProps = {
  items: readonly { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
};

function FilterSelect({ items, value, onChange }: FilterSelectProps) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => onChange(next ?? ALL)}
    >
      <SelectTrigger className="h-9 w-full sm:w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AttributesTable() {
  const { user: me } = useSession();
  const canAdd = can(me, "attribute", "can_add_attribute");
  const canEdit = can(me, "attribute", "can_edit_attribute");
  const canPublish = can(me, "attribute", "can_publish_attribute");
  const canDelete = can(me, "attribute", "can_delete_attribute");
  const canBulk = canEdit || canPublish || canDelete;

  const [search, setSearch] = useState("");
  const [optionFilter, setOptionFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Attribute | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const searchTerm = useDebouncedValue(search.trim());

  const { data, isFetching, isLoading, error } = useGetAttributesQuery({
    searchTerm: searchTerm || undefined,
    option: optionFilter === ALL ? undefined : (optionFilter as AttributeOption),
    type: typeFilter === ALL ? undefined : (typeFilter as AttributeType),
    status: statusFilter === ALL ? undefined : (statusFilter as AttributeStatus),
    page,
    limit: 10,
    sort: "-createdAt",
  });
  const [setStatus] = useSetAttributeStatusMutation();
  const [deleteAttribute, { isLoading: deleting }] = useDeleteAttributeMutation();
  const [bulkUpdate, { isLoading: updating }] = useBulkUpdateAttributesMutation();
  const [bulkDelete, { isLoading: bulkDeleting }] =
    useBulkDeleteAttributesMutation();

  const attributes = data?.data ?? [];
  const selectedIds = [...selected];
  const allOnPageSelected =
    attributes.length > 0 &&
    attributes.every((attribute) => selected.has(attribute._id));
  const someOnPageSelected = attributes.some((attribute) =>
    selected.has(attribute._id),
  );

  const resetView = () => {
    setPage(1);
    setSelected(new Set());
  };

  const toggleAll = (checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      attributes.forEach((attribute) =>
        checked ? next.add(attribute._id) : next.delete(attribute._id),
      );
      return next;
    });
  };

  const onToggleStatus = async (attribute: Attribute, show: boolean) => {
    try {
      await setStatus({
        id: attribute._id,
        status: show ? "show" : "hide",
      }).unwrap();
      toast.success(`${attribute.name} is now ${show ? "showing" : "hidden"}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the status."));
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteAttribute(pendingDelete._id).unwrap();
      toast.success(`${pendingDelete.name} deleted.`);
      setSelected((current) => toggleInSet(current, pendingDelete._id, false));
      setPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the attribute."));
    }
  };

  const onBulkUpdate = async (
    change: Omit<AttributeBulkUpdatePayload, "ids">,
    verb: string,
  ) => {
    try {
      const result = await bulkUpdate({ ids: selectedIds, ...change }).unwrap();
      reportBulkResult(
        result,
        (count) => `${count} attribute${count === 1 ? "" : "s"} ${verb}.`,
      );
      setSelected(new Set());
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the attributes."));
    }
  };

  const onBulkDelete = async () => {
    try {
      const result = await bulkDelete(selectedIds).unwrap();
      reportBulkResult(
        result,
        (count) => `${count} attribute${count === 1 ? "" : "s"} deleted.`,
      );
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the attributes."));
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Attributes"
        description="Product options like size or colour, and the values shoppers pick from."
        actions={
          canAdd && (
            <>
              <Button
                variant="outline"
                render={<Link href="/attributes/import" />}
                nativeButton={false}
              >
                <Upload />
                Import
              </Button>
              <Button
                render={<Link href="/attributes/new" />}
                nativeButton={false}
              >
                <Plus />
                New attribute
              </Button>
            </>
          )
        }
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:flex-wrap">
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
          <FilterSelect
            items={OPTION_FILTERS}
            value={optionFilter}
            onChange={(value) => {
              setOptionFilter(value);
              resetView();
            }}
          />
          <FilterSelect
            items={TYPE_FILTERS}
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              resetView();
            }}
          />
          <FilterSelect
            items={STATUS_FILTERS}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              resetView();
            }}
          />
        </div>

        <BulkActionBar
          count={selected.size}
          noun="attribute"
          onClear={() => setSelected(new Set())}
        >
          {canPublish && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() => onBulkUpdate({ status: "show" }, "shown")}
              >
                <Eye />
                Show
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() => onBulkUpdate({ status: "hide" }, "hidden")}
              >
                <EyeOff />
                Hide
              </Button>
            </>
          )}
          {canEdit && (
            <Select
              items={ATTRIBUTE_OPTIONS}
              value={null}
              onValueChange={(value) =>
                value &&
                onBulkUpdate(
                  { option: value as AttributeOption },
                  `set to ${labelOf(ATTRIBUTE_OPTIONS, value).toLowerCase()}`,
                )
              }
            >
              <SelectTrigger size="sm" className="w-36" disabled={updating}>
                <SelectValue placeholder="Set input" />
              </SelectTrigger>
              <SelectContent>
                {ATTRIBUTE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <TableHead>Input</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden lg:table-cell">Values</TableHead>
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
              <TableRow>
                <TableCell
                  colSpan={COLUMNS}
                  className="px-4 py-10 text-center text-destructive"
                >
                  {getErrorMessage(error, "Could not load attributes.")}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && attributes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No attributes found.
                </TableCell>
              </TableRow>
            )}

            {attributes.map((attribute) => {
              const extra = attribute.values.length - PREVIEW_VALUES;

              return (
                <TableRow
                  key={attribute._id}
                  data-state={selected.has(attribute._id) ? "selected" : undefined}
                >
                  <TableCell className="pl-4">
                    {canBulk && (
                      <Checkbox
                        aria-label={`Select ${attribute.name}`}
                        checked={selected.has(attribute._id)}
                        onCheckedChange={(checked) =>
                          setSelected((current) =>
                            toggleInSet(current, attribute._id, checked),
                          )
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/attributes/${attribute._id}`}
                      className="font-medium hover:underline"
                    >
                      {attribute.name}
                    </Link>
                    <div className="font-mono text-xs text-muted-foreground">
                      {attribute.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {labelOf(ATTRIBUTE_OPTIONS, attribute.option)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">
                      {labelOf(ATTRIBUTE_TYPES, attribute.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden max-w-xs lg:table-cell">
                    {attribute.values.length === 0 ? (
                      <span className="text-muted-foreground">No values</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {attribute.values.slice(0, PREVIEW_VALUES).map((value) => (
                          <Badge
                            key={value._id}
                            variant="outline"
                            className={
                              value.status === "hide" ? "opacity-50" : undefined
                            }
                          >
                            {value.name}
                          </Badge>
                        ))}
                        {extra > 0 && (
                          <span className="text-xs text-muted-foreground">
                            +{extra} more
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      aria-label="Showing"
                      checked={attribute.status === "show"}
                      disabled={!canPublish}
                      onCheckedChange={(checked) =>
                        onToggleStatus(attribute, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Manage values"
                        render={<Link href={`/attributes/${attribute._id}`} />}
                        nativeButton={false}
                      >
                        <ListTree />
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit attribute"
                          render={
                            <Link href={`/attributes/${attribute._id}/edit`} />
                          }
                          nativeButton={false}
                        >
                          <Pencil />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete attribute"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete(attribute)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination pagination={data?.pagination} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete attribute?"
        description={
          <>
            <strong>{pendingDelete?.name}</strong> and its values will be
            removed from every product variant that uses them.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selected.size} attribute${selected.size === 1 ? "" : "s"}?`}
        description="They and their values will no longer be available for products."
        pending={bulkDeleting}
        onConfirm={onBulkDelete}
      />
    </div>
  );
}
