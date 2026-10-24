"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import Form from "@/components/form/form";
import TextField from "@/components/form/text-field";
import { BulkActionBar } from "@/components/layout/bulk-action-bar";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { applyServerErrors } from "@/lib/form-errors";
import { can } from "@/lib/permissions";
import {
  ATTRIBUTE_OPTIONS,
  ATTRIBUTE_TYPES,
  attributeValueSchema,
  type AttributeValueValues,
} from "@/lib/validation/attribute-schemas";
import {
  useAddAttributeValueMutation,
  useBulkDeleteAttributeValuesMutation,
  useDeleteAttributeValueMutation,
  useGetAttributeQuery,
  useSetAttributeValueStatusMutation,
  useUpdateAttributeValueMutation,
} from "@/store/api/attribute/api/attributeApi";
import type { AttributeValue } from "@/store/api/attribute/types";
import { useSession } from "@/store/api/auth/hooks/use-session";

const COLUMNS = 4;

const labelOf = (
  options: readonly { label: string; value: string }[],
  value: string,
) => options.find((option) => option.value === value)?.label ?? value;

export function AttributeValues() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useSession();
  const canEdit = can(me, "attribute", "can_edit_attribute");
  const canPublish = can(me, "attribute", "can_publish_attribute");
  const canDelete = can(me, "attribute", "can_delete_attribute");

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AttributeValue | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { data: attribute, isFetching, isLoading, error } =
    useGetAttributeQuery(id);
  const [addValue, { isLoading: adding }] = useAddAttributeValueMutation();
  const [updateValue, { isLoading: renaming }] = useUpdateAttributeValueMutation();
  const [setValueStatus] = useSetAttributeValueStatusMutation();
  const [deleteValue, { isLoading: deleting }] = useDeleteAttributeValueMutation();
  const [bulkDeleteValues, { isLoading: bulkDeleting }] =
    useBulkDeleteAttributeValuesMutation();

  const addForm = useForm<AttributeValueValues>({
    resolver: zodResolver(attributeValueSchema),
    defaultValues: { name: "" },
  });

  const term = search.trim().toLowerCase();
  const values = (attribute?.values ?? []).filter(
    (value) => !term || value.name.toLowerCase().includes(term),
  );
  const allSelected =
    values.length > 0 && values.every((value) => selected.has(value._id));
  const someSelected = values.some((value) => selected.has(value._id));

  const onAdd = async ({ name }: AttributeValueValues) => {
    try {
      await addValue({ id, data: { name } }).unwrap();
      toast.success(`${name} added.`);
      addForm.reset({ name: "" });
    } catch (err) {
      const outcome = applyServerErrors(err, addForm.setError, ["name"]);
      if (outcome.formMessage) {
        addForm.setError("name", { message: outcome.formMessage });
      }
    }
  };

  const startEdit = (value: AttributeValue) => {
    setEditingId(value._id);
    setEditName(value.name);
  };

  const saveEdit = async (value: AttributeValue) => {
    const name = editName.trim();
    if (!name || name === value.name) {
      setEditingId(null);
      return;
    }

    try {
      await updateValue({ id, valueId: value._id, data: { name } }).unwrap();
      toast.success(`Renamed to ${name}.`);
      setEditingId(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not rename the value."));
    }
  };

  const onToggleStatus = async (value: AttributeValue, show: boolean) => {
    try {
      await setValueStatus({
        id,
        valueId: value._id,
        status: show ? "show" : "hide",
      }).unwrap();
      toast.success(`${value.name} is now ${show ? "showing" : "hidden"}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the status."));
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteValue({ id, valueId: pendingDelete._id }).unwrap();
      toast.success(`${pendingDelete.name} deleted.`);
      setSelected((current) => toggleInSet(current, pendingDelete._id, false));
      setPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the value."));
    }
  };

  const onBulkDelete = async () => {
    try {
      const result = await bulkDeleteValues({
        id,
        valueIds: [...selected],
      }).unwrap();
      reportBulkResult(
        result,
        (count) => `${count} value${count === 1 ? "" : "s"} deleted.`,
      );
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the values."));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !attribute) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Attribute not found.")}
      </p>
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        title={attribute.name}
        description="Manage the values shoppers can pick for this attribute."
        actions={
          <>
            <Button
              variant="outline"
              render={<Link href="/attributes" />}
              nativeButton={false}
            >
              <ArrowLeft />
              All attributes
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                render={<Link href={`/attributes/${attribute._id}/edit`} />}
                nativeButton={false}
              >
                <Pencil />
                Edit attribute
              </Button>
            )}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">
          {labelOf(ATTRIBUTE_OPTIONS, attribute.option)}
        </Badge>
        <Badge variant="outline">{labelOf(ATTRIBUTE_TYPES, attribute.type)}</Badge>
        <Badge variant={attribute.status === "show" ? "default" : "destructive"}>
          {attribute.status === "show" ? "Showing" : "Hidden"}
        </Badge>
        <span className="font-mono text-xs text-muted-foreground">
          {attribute.slug}
        </span>
      </div>

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-start">
          <div className="relative flex-1 md:max-w-xs">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelected(new Set());
              }}
              placeholder="Search values"
              className="h-9 pl-9"
            />
          </div>

          {canEdit && (
            <Form
              form={addForm}
              onSubmit={onAdd}
              className="flex flex-1 items-start gap-2 md:ml-auto md:max-w-md [&_[data-slot=field-label]]:sr-only"
            >
              <div className="flex-1">
                <TextField
                  control={addForm.control}
                  name="name"
                  label="New value"
                  placeholder="Add a value, e.g. XL"
                  className="h-9"
                />
              </div>
              <Button type="submit" disabled={adding} className="h-9">
                {adding ? (
                  <Loader2 aria-hidden className="animate-spin" />
                ) : (
                  <Plus />
                )}
                Add
              </Button>
            </Form>
          )}
        </div>

        <BulkActionBar
          count={selected.size}
          noun="value"
          onClear={() => setSelected(new Set())}
        >
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
                {canDelete && (
                  <Checkbox
                    aria-label="Select all values"
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onCheckedChange={(checked) =>
                      setSelected(
                        checked
                          ? new Set(values.map((value) => value._id))
                          : new Set(),
                      )
                    }
                  />
                )}
              </TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Showing</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching ? "opacity-60" : ""}>
            {values.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  {attribute.values.length === 0
                    ? "No values yet. Add the first one above."
                    : "No values match your search."}
                </TableCell>
              </TableRow>
            )}

            {values.map((value) => {
              const editing = editingId === value._id;

              return (
                <TableRow
                  key={value._id}
                  data-state={selected.has(value._id) ? "selected" : undefined}
                >
                  <TableCell className="pl-4">
                    {canDelete && (
                      <Checkbox
                        aria-label={`Select ${value.name}`}
                        checked={selected.has(value._id)}
                        onCheckedChange={(checked) =>
                          setSelected((current) =>
                            toggleInSet(current, value._id, checked),
                          )
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {editing ? (
                      <Input
                        autoFocus
                        aria-label="Value name"
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") saveEdit(value);
                          if (event.key === "Escape") setEditingId(null);
                        }}
                        className="h-8 max-w-xs"
                      />
                    ) : (
                      <span className="font-medium">{value.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      aria-label="Showing"
                      checked={value.status === "show"}
                      disabled={!canPublish}
                      onCheckedChange={(checked) => onToggleStatus(value, checked)}
                    />
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-1">
                      {editing ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Save"
                            disabled={renaming}
                            onClick={() => saveEdit(value)}
                          >
                            {renaming ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <Check />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Cancel"
                            onClick={() => setEditingId(null)}
                          >
                            <X />
                          </Button>
                        </>
                      ) : (
                        <>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Rename value"
                              onClick={() => startEdit(value)}
                            >
                              <Pencil />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Delete value"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setPendingDelete(value)}
                            >
                              <Trash2 />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete value?"
        description={
          <>
            <strong>{pendingDelete?.name}</strong> will be removed from every
            product variant that uses it. Variants left with no options are
            deleted.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selected.size} value${selected.size === 1 ? "" : "s"}?`}
        description="They will be removed from every product variant that uses them."
        pending={bulkDeleting}
        onConfirm={onBulkDelete}
      />
    </div>
  );
}
