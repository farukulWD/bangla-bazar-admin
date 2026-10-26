"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  Eye,
  EyeOff,
  FolderInput,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { useCategoryOptions } from "@/components/form/category-select-field";
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
import { toggleInSet } from "@/lib/bulk";
import { can } from "@/lib/permissions";
import { ROOT_PARENT } from "@/lib/validation/category-schemas";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useBulkDeleteProductsMutation,
  useBulkUpdateProductsMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useSetProductStatusMutation,
} from "@/store/api/product/api/productApi";
import type {
  Product,
  ProductBulkUpdatePayload,
  ProductStatus,
} from "@/store/api/product/types";
import { useGetPublicSettingsQuery } from "@/store/api/settings/api/settingsApi";

import { ExportProductsDialog } from "./export-products-dialog";
import { SetCategoryDialog } from "./set-category-dialog";

const ALL = "all";
const COLUMNS = 8;
const LOW_STOCK = 5;

const STATUS_FILTERS = [
  { label: "All statuses", value: ALL },
  { label: "Showing", value: "show" },
  { label: "Hidden", value: "hide" },
];
const STOCK_FILTERS = [
  { label: "All products", value: ALL },
  { label: "In stock", value: "inStock" },
  { label: "On sale", value: "discounted" },
];
const SORTS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Oldest", value: "createdAt" },
  { label: "Price: low to high", value: "prices.price" },
  { label: "Price: high to low", value: "-prices.price" },
  { label: "Best selling", value: "-sales" },
  { label: "Title A–Z", value: "title" },
];

type FilterSelectProps = {
  items: readonly { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function FilterSelect({ items, value, onChange, className }: FilterSelectProps) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => onChange(next ?? ALL)}
    >
      <SelectTrigger className={className ?? "h-9 w-full sm:w-36"}>
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

const categoryName = (product: Product) =>
  typeof product.category === "string" ? "—" : product.category.name;

export function ProductsTable() {
  const { user: me } = useSession();
  const canAdd = can(me, "product", "can_add_product");
  const canEdit = can(me, "product", "can_edit_product");
  const canPublish = can(me, "product", "can_publish_product");
  const canDelete = can(me, "product", "can_delete_product");
  const canView = can(me, "product", "can_view_products");
  const canBulk = canEdit || canPublish || canDelete;

  const { data: settings } = useGetPublicSettingsQuery();
  const currency = settings?.store?.currencySymbol ?? "৳";
  const money = (value: number) =>
    `${currency}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const { options: categoryOptions } = useCategoryOptions();
  const categoryFilters = [
    { label: "All categories", value: ALL },
    ...categoryOptions.filter((option) => option.value !== ROOT_PARENT),
  ];

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [stockFilter, setStockFilter] = useState(ALL);
  const [sort, setSort] = useState(SORTS[0].value);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const searchTerm = useDebouncedValue(search.trim());

  const { data, isFetching, isLoading, error } = useGetProductsQuery({
    searchTerm: searchTerm || undefined,
    category: categoryFilter === ALL ? undefined : categoryFilter,
    status: statusFilter === ALL ? undefined : (statusFilter as ProductStatus),
    inStock: stockFilter === "inStock" || undefined,
    discounted: stockFilter === "discounted" || undefined,
    page,
    limit: 10,
    sort,
  });
  const [setStatus] = useSetProductStatusMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [bulkUpdate, { isLoading: updating }] = useBulkUpdateProductsMutation();
  const [bulkDelete, { isLoading: bulkDeleting }] =
    useBulkDeleteProductsMutation();

  const products = data?.data ?? [];
  const stale = isFetching || search.trim() !== searchTerm;
  const selectedIds = [...selected];
  const allOnPageSelected =
    products.length > 0 && products.every((product) => selected.has(product._id));
  const someOnPageSelected = products.some((product) => selected.has(product._id));

  const resetView = () => {
    setPage(1);
    setSelected(new Set());
  };

  const filterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    resetView();
  };

  const toggleAll = (checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      products.forEach((product) =>
        checked ? next.add(product._id) : next.delete(product._id),
      );
      return next;
    });
  };

  const plural = (count: number) => `${count} product${count === 1 ? "" : "s"}`;

  const onToggleStatus = async (product: Product, show: boolean) => {
    try {
      await setStatus({ id: product._id, status: show ? "show" : "hide" }).unwrap();
      toast.success(`${product.title} is now ${show ? "showing" : "hidden"}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the status."));
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteProduct(pendingDelete._id).unwrap();
      toast.success(`${pendingDelete.title} deleted.`);
      setSelected((current) => toggleInSet(current, pendingDelete._id, false));
      setPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the product."));
    }
  };

  const onBulkUpdate = async (
    change: Omit<ProductBulkUpdatePayload, "ids">,
    verb: string,
  ) => {
    try {
      const result = await bulkUpdate({ ids: selectedIds, ...change }).unwrap();
      toast.success(`${plural(result.updated)} ${verb}.`);
      setSelected(new Set());
      setCategoryOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the products."));
    }
  };

  const onBulkDelete = async () => {
    try {
      const result = await bulkDelete(selectedIds).unwrap();
      toast.success(`${plural(result.deleted)} deleted.`);
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the products."));
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Products"
        description="Everything customers can browse and buy in the store."
        actions={
          <>
            {canView && (
              <Button variant="outline" onClick={() => setExportOpen(true)}>
                <Download />
                Export
              </Button>
            )}
            {canAdd && (
              <>
                <Button
                  variant="outline"
                  render={<Link href="/products/import" />}
                  nativeButton={false}
                >
                  <Upload />
                  Import
                </Button>
                <Button
                  render={<Link href="/products/new" />}
                  nativeButton={false}
                >
                  <Plus />
                  New product
                </Button>
              </>
            )}
          </>
        }
      />

      <Card className="gap-0 overflow-clip py-0">
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
              placeholder="Search title, slug, SKU or barcode"
              className="h-9 pl-9"
            />
          </div>
          <FilterSelect
            items={categoryFilters}
            value={categoryFilter}
            onChange={filterChange(setCategoryFilter)}
            className="h-9 w-full sm:w-48"
          />
          <FilterSelect
            items={STATUS_FILTERS}
            value={statusFilter}
            onChange={filterChange(setStatusFilter)}
          />
          <FilterSelect
            items={STOCK_FILTERS}
            value={stockFilter}
            onChange={filterChange(setStockFilter)}
          />
          <FilterSelect
            items={SORTS}
            value={sort}
            onChange={filterChange(setSort)}
            className="h-9 w-full sm:ml-auto sm:w-44"
          />
        </div>

        <BulkActionBar
          count={selected.size}
          noun="product"
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
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => setCategoryOpen(true)}
            >
              <FolderInput />
              Set category
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
                    disabled={stale}
                    checked={allOnPageSelected}
                    indeterminate={someOnPageSelected && !allOnPageSelected}
                    onCheckedChange={toggleAll}
                  />
                )}
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="hidden lg:table-cell">Variants</TableHead>
              <TableHead>Showing</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={stale && !isLoading ? "opacity-60" : ""}>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={COLUMNS} className="px-4">
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && error && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS}
                  className="px-4 py-10 text-center text-destructive"
                >
                  {getErrorMessage(error, "Could not load products.")}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && products.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}

            {products.map((product) => {
              const cover = product.images[0];
              const onSale = product.prices.discount > 0;

              return (
                <TableRow
                  key={product._id}
                  data-state={selected.has(product._id) ? "selected" : undefined}
                >
                  <TableCell className="pl-4">
                    {canBulk && (
                      <Checkbox
                        aria-label={`Select ${product.title}`}
                        disabled={stale}
                        checked={selected.has(product._id)}
                        onCheckedChange={(checked) =>
                          setSelected((current) =>
                            toggleInSet(current, product._id, checked),
                          )
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt="" className="size-full object-cover" />
                        ) : product.imageStatus === "processing" ? (
                          <Loader2
                            aria-label="Images uploading"
                            className="size-4 animate-spin text-muted-foreground"
                          />
                        ) : (
                          <ImageIcon
                            aria-hidden
                            className="size-4 text-muted-foreground"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        {canEdit ? (
                          <Link
                            href={`/products/${product._id}/edit`}
                            className="line-clamp-1 font-medium hover:underline"
                          >
                            {product.title}
                          </Link>
                        ) : (
                          <span className="line-clamp-1 font-medium">
                            {product.title}
                          </span>
                        )}
                        <div className="font-mono text-xs text-muted-foreground">
                          {product.sku || product.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {categoryName(product)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-medium">{money(product.prices.price)}</div>
                    {onSale && (
                      <div className="text-xs text-muted-foreground line-through">
                        {money(product.prices.originalPrice)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.stock === 0 ? (
                      <Badge variant="destructive">Out of stock</Badge>
                    ) : (
                      <span
                        className={
                          product.stock <= LOW_STOCK ? "text-destructive" : undefined
                        }
                      >
                        {product.stock}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {product.isCombination ? (
                      <Badge variant="outline">{product.variants.length}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      aria-label="Showing"
                      checked={product.status === "show"}
                      disabled={!canPublish}
                      onCheckedChange={(checked) => onToggleStatus(product, checked)}
                    />
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-1">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit product"
                          render={<Link href={`/products/${product._id}/edit`} />}
                          nativeButton={false}
                        >
                          <Pencil />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete product"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete(product)}
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
        title="Delete product?"
        description={
          <>
            <strong>{pendingDelete?.title}</strong> will be removed from the
            store.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${plural(selected.size)}?`}
        description="They will be removed from the store."
        pending={bulkDeleting}
        onConfirm={onBulkDelete}
      />

      <SetCategoryDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        count={selected.size}
        pending={updating}
        onConfirm={(category) => onBulkUpdate({ category }, "moved")}
      />

      <ExportProductsDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}
