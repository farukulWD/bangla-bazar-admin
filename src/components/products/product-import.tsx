"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileUp,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { AccessDenied } from "@/components/auth/access-denied";
import FormAlert from "@/components/form/form-alert";
import {
  compact,
  download,
  findParent,
  readRows,
  text,
  type RawRow,
} from "@/components/import/bulk-import";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/api-error";
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import { baseApi } from "@/store/api/baseApi";
import type { BulkResult, CategoryNode } from "@/store/api/category/types";
import { useGetCategoryTreeQuery } from "@/store/api/category/api/categoryApi";
import {
  useBulkCreateProductsMutation,
  useLazyGetProductJobQuery,
} from "@/store/api/product/api/productApi";
import type {
  ImportJobResult,
  ProductPayload,
  ProductVariantPayload,
} from "@/store/api/product/types";
import { tagTypes } from "@/store/api/tagTypes";
import { useAppDispatch } from "@/store/hooks";

const CHUNK_SIZE = 500;
const PREVIEW_ROWS = 10;
const POLL_MS = 1500;
const OBJECT_ID = /^[a-f0-9]{24}$/i;

const COLUMNS = [
  "title",
  "slug",
  "description",
  "sku",
  "barcode",
  "category",
  "categories",
  "tags",
  "images",
  "originalPrice",
  "price",
  "stock",
  "status",
];

const CSV_EXAMPLE =
  "title,slug,description,sku,barcode,category,categories,tags,images,originalPrice,price,stock,status\n" +
  "Red apples 1kg,,Crisp and sweet,APL-1,,fruits,,fresh|apple,https://example.com/apple.jpg,250,220,40,show\n";

const JSON_EXAMPLE = [
  {
    title: "Red apples 1kg",
    category: "fruits",
    tags: ["fresh", "apple"],
    images: ["https://example.com/apple.jpg"],
    prices: { originalPrice: 250, price: 220 },
    stock: 40,
    status: "show",
  },
];

type ImportRow = {
  payload: Partial<ProductPayload> & { title: string };
  categoryRef: string;
  categoryName: string | null;
};

const list = (value: unknown) =>
  (Array.isArray(value) ? value : text(value).split("|"))
    .map((item) => text(item))
    .filter(Boolean);

const number = (value: unknown) => {
  const raw = text(value);
  return raw === "" ? undefined : Number(raw);
};

const resolveCategory = (value: string, tree: CategoryNode[]) =>
  value ? findParent(value, tree) : undefined;

const toVariants = (value: unknown): ProductVariantPayload[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((variant: RawRow) => variant && !variant.isDeleted)
    .map((variant: RawRow) =>
      compact({
        _id: undefined,
        options: Array.isArray(variant.options)
          ? (variant.options as RawRow[]).map((option) => ({
              attributeId: text(option.attributeId),
              valueId: text(option.valueId),
            }))
          : [],
        sku: text(variant.sku),
        barcode: text(variant.barcode),
        originalPrice: number(variant.originalPrice) as number,
        price: number(variant.price) as number,
        stock: number(variant.stock),
        image: text(variant.image),
      }),
    );
};

const toImportRow = (raw: RawRow, tree: CategoryNode[]): ImportRow => {
  const prices = (raw.prices ?? {}) as RawRow;
  const categoryRef = text(raw.category);
  const primary = resolveCategory(categoryRef, tree);
  const extra = list(raw.categories).map(
    (ref) => resolveCategory(ref, tree)?._id ?? ref,
  );
  const variants = toVariants(raw.variants);

  const payload = compact({
    title: text(raw.title),
    slug: text(raw.slug),
    description: text(raw.description),
    sku: text(raw.sku),
    barcode: text(raw.barcode),
    category: primary?._id ?? categoryRef,
    categories: extra.length ? extra : undefined,
    tags: list(raw.tags),
    images: list(raw.images),
    prices: {
      originalPrice: number(prices.originalPrice ?? raw.originalPrice) as number,
      price: number(prices.price ?? raw.price) as number,
    },
    stock: number(raw.stock),
    status: (text(raw.status).toLowerCase() || undefined) as ProductPayload["status"],
    variants: variants?.length ? variants : undefined,
  });

  return {
    payload,
    categoryRef,
    categoryName: primary?.name ?? (OBJECT_ID.test(categoryRef) ? null : ""),
  };
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ProductImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { user, isLoading: loadingSession } = useSession();
  const allowed = can(user, "product", "can_add_product");

  const { data: tree = [] } = useGetCategoryTreeQuery();
  const [bulkCreate] = useBulkCreateProductsMutation();
  const [fetchJob] = useLazyGetProductJobQuery();

  const [fileName, setFileName] = useState<string | null>(null);
  const [raw, setRaw] = useState<RawRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [result, setResult] = useState<BulkResult | null>(null);

  const rows = raw.map((entry) => toImportRow(entry, tree));

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setResult(null);
    setParseError(null);
    setFileName(file.name);

    try {
      const parsed = await readRows(file, "products");
      if (parsed.length === 0) throw new Error("The file has no rows.");
      setRaw(parsed);
    } catch (err) {
      setRaw([]);
      setParseError(err instanceof Error ? err.message : "Could not read the file.");
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const runChunk = async (payloads: unknown[]): Promise<ImportJobResult> => {
    const { jobId } = await bulkCreate(payloads).unwrap();
    for (;;) {
      await wait(POLL_MS);
      const job = await fetchJob(jobId, false).unwrap();
      if (job.state === "completed") return job.result as ImportJobResult;
      if (job.state === "failed") {
        throw new Error(job.failedReason || "The import job failed.");
      }
    }
  };

  const onImport = async () => {
    const total: BulkResult = { succeeded: 0, failed: [] };

    try {
      for (let start = 0; start < rows.length; start += CHUNK_SIZE) {
        const chunk = rows.slice(start, start + CHUNK_SIZE);
        setProgress(
          `Importing ${start + 1}–${start + chunk.length} of ${rows.length}…`,
        );
        const outcome = await runChunk(chunk.map((row) => row.payload));
        total.succeeded += outcome.succeeded;
        total.failed.push(
          ...outcome.failed.map((entry) => ({ ...entry, index: entry.index + start })),
        );
      }
      setResult(total);
      if (total.failed.length === 0) {
        toast.success(`${total.succeeded} products imported.`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "The import failed."));
      if (total.succeeded > 0) setResult(total);
    } finally {
      setProgress(null);
      if (total.succeeded > 0) {
        dispatch(baseApi.util.invalidateTags([tagTypes.product]));
      }
    }
  };

  if (!loadingSession && !allowed) {
    return (
      <AccessDenied message="Your role does not include permission to add products." />
    );
  }

  const importing = progress !== null;

  return (
    <div className="w-full">
      <PageHeader
        title="Import products"
        description="Create many products at once from a CSV or JSON file."
        actions={
          <Button
            variant="outline"
            render={<Link href="/products" />}
            nativeButton={false}
          >
            <ArrowLeft />
            Back
          </Button>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>File</CardTitle>
            <CardDescription>
              Columns: <code>{COLUMNS.join(", ")}</code>. title, category,
              originalPrice and price are required. category accepts an id, slug
              or name. Separate categories, tags and images with | in CSV.
              Variants can only be imported from JSON, including files made by
              Export.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              type="button"
              disabled={importing}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                pick(event.dataTransfer.files[0]);
              }}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-10 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground",
                dragging && "border-ring bg-muted",
              )}
            >
              <FileUp aria-hidden className="size-6" />
              {fileName ? (
                <span>
                  <strong className="text-foreground">{fileName}</strong> —
                  click or drop to replace
                </span>
              ) : (
                <span>Drop a .csv or .json file here, or click to choose</span>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.json,text/csv,application/json"
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => pick(event.target.files?.[0])}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => download("products-template.csv", CSV_EXAMPLE, "text/csv")}
              >
                <Download />
                CSV template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  download(
                    "products-template.json",
                    JSON.stringify(JSON_EXAMPLE, null, 2),
                    "application/json",
                  )
                }
              >
                <Download />
                JSON template
              </Button>
            </div>

            <FormAlert message={parseError} />
          </CardContent>
        </Card>

        {rows.length > 0 && !result && (
          <Card className="gap-0 pb-0">
            <CardHeader className="pb-4">
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                {rows.length} row{rows.length === 1 ? "" : "s"} found
                {rows.length > PREVIEW_ROWS && `, showing the first ${PREVIEW_ROWS}`}.
              </CardDescription>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 pl-6">Row</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="pr-6">Variants</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, PREVIEW_ROWS).map(({ payload, categoryRef, categoryName }, index) => (
                  <TableRow key={index}>
                    <TableCell className="pl-6 text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {payload.title || (
                        <span className="text-destructive">Missing title</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!categoryRef ? (
                        <span className="text-destructive">Missing</span>
                      ) : categoryName === "" ? (
                        <span className="text-destructive">
                          &quot;{categoryRef}&quot; not found
                        </span>
                      ) : (
                        (categoryName ?? categoryRef)
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payload.prices?.price ?? "—"}
                    </TableCell>
                    <TableCell className="pr-6">
                      {payload.variants?.length ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-end gap-3 border-t p-4">
              {progress && (
                <span className="text-sm text-muted-foreground">{progress}</span>
              )}
              <Button disabled={importing} onClick={onImport}>
                {importing && <Loader2 aria-hidden className="animate-spin" />}
                Import {rows.length} products
              </Button>
            </div>
          </Card>
        )}

        {result && (
          <Card className="gap-0 pb-0">
            <CardHeader className="pb-4">
              <CardTitle>Result</CardTitle>
              <div className="flex flex-wrap gap-4 pt-1 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 aria-hidden className="size-4 text-primary" />
                  {result.succeeded} imported
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <XCircle aria-hidden className="size-4 text-destructive" />
                  {result.failed.length} failed
                </span>
              </div>
            </CardHeader>
            {result.failed.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14 pl-6">Row</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="pr-6">Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.failed.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="pl-6 text-muted-foreground">
                        {entry.index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.identifier ?? "—"}
                      </TableCell>
                      <TableCell className="pr-6 whitespace-normal text-destructive">
                        {entry.error}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="flex justify-end gap-2 border-t p-4">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setRaw([]);
                  setFileName(null);
                }}
              >
                Import another file
              </Button>
              <Button render={<Link href="/products" />} nativeButton={false}>
                View products
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
