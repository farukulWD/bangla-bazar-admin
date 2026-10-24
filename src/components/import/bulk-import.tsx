"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
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
import { flattenTree } from "@/lib/categories";
import { formatDate, toCouponRow } from "@/lib/coupons";
import { can } from "@/lib/permissions";
import { useBulkCreateAttributesMutation } from "@/store/api/attribute/api/attributeApi";
import type { AttributePayload } from "@/store/api/attribute/types";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useBulkCreateCategoriesMutation,
  useGetCategoryTreeQuery,
} from "@/store/api/category/api/categoryApi";
import type {
  BulkResult,
  CategoryNode,
  CategoryPayload,
} from "@/store/api/category/types";
import { useBulkCreateCouponsMutation } from "@/store/api/coupon/api/couponApi";
import type { CouponPayload } from "@/store/api/coupon/types";

const CHUNK_SIZE = 500;
const PREVIEW_ROWS = 10;
const OBJECT_ID = /^[a-f0-9]{24}$/i;

type Kind = "category" | "attribute" | "coupon";
export type RawRow = Record<string, unknown>;
type CategoryRow = Omit<CategoryPayload, "parentId"> & { parent?: string };
type Row = CategoryRow | AttributePayload | CouponPayload;
type Indexed<T> = { index: number; row: T };

const CONFIG = {
  category: {
    title: "Import categories",
    plural: "categories",
    listHref: "/categories",
    permission: { module: "category", key: "can_add_category" },
    columns: ["name", "slug", "description", "parent", "status"],
    required: "Only name is required.",
    csvExample:
      "name,slug,description,parent,status\nVegetables,,Fresh produce,,show\nLeafy greens,,,vegetables,show\n",
    jsonExample: [
      { name: "Vegetables", description: "Fresh produce", status: "show" },
      { name: "Leafy greens", parent: "vegetables", status: "show" },
    ],
    help: "parent accepts an existing category's id, slug or name. Leave it empty for a top-level category. status is show or hide.",
  },
  attribute: {
    title: "Import attributes",
    plural: "attributes",
    listHref: "/attributes",
    permission: { module: "attribute", key: "can_add_attribute" },
    columns: ["name", "slug", "option", "type", "status", "values"],
    required: "Only name and option are required.",
    csvExample:
      "name,slug,option,type,status,values\nSize,,dropdown,attribute,show,S|M|L|XL\nColour,,radio,attribute,show,Red|Green|Blue\n",
    jsonExample: [
      { name: "Size", option: "dropdown", values: ["S", "M", "L", "XL"] },
      { name: "Colour", option: "radio", values: ["Red", "Green", "Blue"] },
    ],
    help: "option is dropdown, radio or checkbox. type is attribute or extra. Separate values with | in CSV, or use an array in JSON.",
  },
  coupon: {
    title: "Import coupons",
    plural: "coupons",
    listHref: "/coupons",
    permission: { module: "coupon", key: "can_add_coupon" },
    columns: [
      "title",
      "couponCode",
      "discountType",
      "discountValue",
      "maxDiscountAmount",
      "minimumAmount",
      "startTime",
      "endTime",
      "status",
    ],
    required: "title, couponCode, discountType, discountValue and endTime are required.",
    csvExample:
      "title,couponCode,discountType,discountValue,maxDiscountAmount,minimumAmount,startTime,endTime,status\nEid sale,EID10,percentage,10,200,500,2026-11-01,2026-11-30,show\nWelcome,WELCOME50,fixed,50,,300,,2026-12-31,show\n",
    jsonExample: [
      {
        title: "Eid sale",
        couponCode: "EID10",
        discountType: "percentage",
        discountValue: 10,
        maxDiscountAmount: 200,
        minimumAmount: 500,
        startTime: "2026-11-01",
        endTime: "2026-11-30",
      },
      {
        title: "Welcome",
        couponCode: "WELCOME50",
        discountType: "fixed",
        discountValue: 50,
        endTime: "2026-12-31",
      },
    ],
    help: "discountType is percentage or fixed. maxDiscountAmount only applies to percentage. Dates accept any format like 2026-11-30. status is show or hide.",
  },
} as const;

const ROW_MAPPERS = {
  category: (raw: RawRow): Row => toCategoryRow(raw),
  attribute: (raw: RawRow): Row => toAttributeRow(raw),
  coupon: (raw: RawRow): Row => toCouponRow(raw),
};

const rowName = (row: Row) => ("title" in row ? row.title : row.name);

export const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : value == null ? "" : String(value);

export const compact = <T extends Record<string, unknown>>(row: T): T =>
  Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== "" && value !== undefined),
  ) as T;

export const findParent = (value: string, tree: CategoryNode[]) => {
  const key = value.toLowerCase();
  const flat = flattenTree(tree).map(({ node }) => node);
  return (
    flat.find((node) => node._id === value) ??
    flat.find((node) => node.slug === key) ??
    flat.find((node) => node.name.toLowerCase() === key)
  );
};

const definedInFile = (value: string, rows: CategoryRow[]) => {
  const key = value.toLowerCase();
  return rows.some(
    (row) => row.name?.toLowerCase() === key || row.slug?.toLowerCase() === key,
  );
};

const toCategoryRow = (raw: RawRow): CategoryRow =>
  compact({
    name: text(raw.name),
    slug: text(raw.slug),
    description: text(raw.description),
    parent: text(raw.parent ?? raw.parentId),
    status: text(raw.status).toLowerCase() as CategoryPayload["status"],
  });

const toCategoryPayload = (
  { parent, ...row }: CategoryRow,
  tree: CategoryNode[],
): CategoryPayload => ({
  ...row,
  parentId: parent ? (findParent(parent, tree)?._id ?? parent) : null,
});

const toAttributeRow = (raw: RawRow): AttributePayload => {
  const values = Array.isArray(raw.values)
    ? raw.values
    : text(raw.values).split("|");

  return compact({
    name: text(raw.name),
    slug: text(raw.slug),
    option: text(raw.option).toLowerCase() as AttributePayload["option"],
    type: text(raw.type).toLowerCase() as AttributePayload["type"],
    status: text(raw.status).toLowerCase() as AttributePayload["status"],
    values: values
      .map((value) =>
        typeof value === "object" && value !== null && "name" in value
          ? { name: text((value as RawRow).name) }
          : { name: text(value) },
      )
      .filter((value) => value.name),
  });
};

export const readRows = async (
  file: File,
  plural: string,
): Promise<RawRow[]> => {
  const content = await file.text();

  if (file.name.toLowerCase().endsWith(".json")) {
    const parsed: unknown = JSON.parse(content);
    const list = Array.isArray(parsed)
      ? parsed
      : (parsed as Record<string, unknown>)?.[plural];
    if (!Array.isArray(list)) {
      throw new Error(`The JSON must be an array of ${plural}.`);
    }
    return list as RawRow[];
  }

  const parsed = Papa.parse<RawRow>(content, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim().toLowerCase(),
  });
  if (parsed.errors.length > 0) {
    const first = parsed.errors[0];
    throw new Error(`CSV row ${(first.row ?? 0) + 2}: ${first.message}`);
  }
  return parsed.data;
};

export const download = (name: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
};

const summarize = (row: Row, kind: Kind, tree: CategoryNode[], rows: Row[]) => {
  if (kind === "coupon") {
    const coupon = row as CouponPayload;
    return [
      coupon.couponCode ?? "—",
      coupon.discountType === "percentage"
        ? `${coupon.discountValue}%`
        : `${coupon.discountValue ?? "—"} off`,
      coupon.endTime ? `ends ${formatDate(coupon.endTime)}` : "no end date",
    ].join(" · ");
  }
  if (kind === "attribute") {
    const attribute = row as AttributePayload;
    return [
      attribute.option ?? "—",
      attribute.type ?? "attribute",
      `${attribute.values?.length ?? 0} values`,
    ].join(" · ");
  }
  const { parent } = row as CategoryRow;
  if (!parent) return "Top level";
  const existing = findParent(parent, tree);
  if (existing) return `Under ${existing.name}`;
  if (definedInFile(parent, rows as CategoryRow[])) return `Under ${parent} (from this file)`;
  if (OBJECT_ID.test(parent)) return `Under ${parent}`;
  return `Parent "${parent}" not found`;
};

type BulkImportProps = {
  kind: Kind;
};

export function BulkImport({ kind }: BulkImportProps) {
  const config = CONFIG[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading: loadingSession } = useSession();
  const allowed = can(user, config.permission.module, config.permission.key);

  const { data: tree = [], refetch: refetchTree } = useGetCategoryTreeQuery(
    undefined,
    { skip: kind !== "category" },
  );
  const [bulkCategories] = useBulkCreateCategoriesMutation();
  const [bulkAttributes] = useBulkCreateAttributesMutation();
  const [bulkCoupons] = useBulkCreateCouponsMutation();

  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setResult(null);
    setParseError(null);
    setFileName(file.name);

    try {
      const raw = await readRows(file, config.plural);
      const mapped = raw.map(ROW_MAPPERS[kind]);
      if (mapped.length === 0) throw new Error("The file has no rows.");
      setRows(mapped);
    } catch (err) {
      setRows([]);
      setParseError(
        err instanceof Error ? err.message : "Could not read the file.",
      );
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const send = async <T,>(
    batch: Indexed<T>[],
    total: BulkResult,
    create: (payloads: T[]) => Promise<BulkResult>,
  ) => {
    for (let start = 0; start < batch.length; start += CHUNK_SIZE) {
      const chunk = batch.slice(start, start + CHUNK_SIZE);
      const outcome = await create(chunk.map((entry) => entry.row));
      total.succeeded += outcome.succeeded;
      total.failed.push(
        ...outcome.failed.map((entry) => ({
          ...entry,
          index: entry.index < 0 ? entry.index : chunk[entry.index].index,
        })),
      );
    }
  };

  const importCategories = async (total: BulkResult) => {
    let current = tree;
    const unknownParent = (row: CategoryRow) =>
      Boolean(row.parent) &&
      !findParent(row.parent!, current) &&
      !definedInFile(row.parent!, rows as CategoryRow[]) &&
      !OBJECT_ID.test(row.parent!);
    const indexed = (rows as CategoryRow[]).map((row, index) => ({ index, row }));
    let pending = indexed.filter(({ row }) => !unknownParent(row));

    total.failed.push(
      ...indexed
        .filter(({ row }) => unknownParent(row))
        .map(({ index, row }) => ({
          index,
          identifier: row.name,
          error: `Parent "${row.parent}" not found`,
        })),
    );

    while (pending.length > 0) {
      const ready = pending.filter(
        ({ row }) =>
          !row.parent ||
          findParent(row.parent, current) ||
          !definedInFile(row.parent, rows as CategoryRow[]),
      );

      if (ready.length === 0) {
        total.failed.push(
          ...pending.map(({ index, row }) => ({
            index,
            identifier: row.name,
            error: `Parent "${row.parent}" was not created`,
          })),
        );
        break;
      }

      await send(
        ready.map(({ index, row }) => ({
          index,
          row: toCategoryPayload(row, current),
        })),
        total,
        (payloads) => bulkCategories(payloads).unwrap(),
      );

      pending = pending.filter((entry) => !ready.includes(entry));
      if (pending.length > 0) current = (await refetchTree().unwrap()) ?? [];
    }
  };

  const onImport = async () => {
    setImporting(true);
    const total: BulkResult = { succeeded: 0, failed: [] };

    try {
      if (kind === "category") {
        await importCategories(total);
      } else if (kind === "attribute") {
        await send(
          (rows as AttributePayload[]).map((row, index) => ({ index, row })),
          total,
          (payloads) => bulkAttributes(payloads).unwrap(),
        );
      } else {
        await send(
          (rows as CouponPayload[]).map((row, index) => ({ index, row })),
          total,
          (payloads) => bulkCoupons(payloads).unwrap(),
        );
      }
      total.failed.sort((a, b) => a.index - b.index);
      setResult(total);
      if (total.failed.length === 0) {
        toast.success(`${total.succeeded} ${config.plural} imported.`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "The import failed."));
      if (total.succeeded > 0) setResult(total);
    } finally {
      setImporting(false);
    }
  };

  if (!loadingSession && !allowed) {
    return (
      <AccessDenied
        message={`Your role does not include permission to add ${config.plural}.`}
      />
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        title={config.title}
        description={`Create many ${config.plural} at once from a CSV or JSON file.`}
        actions={
          <Button
            variant="outline"
            render={<Link href={config.listHref} />}
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
              Columns: <code>{config.columns.join(", ")}</code>.{" "}
              {config.required} {config.help}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              type="button"
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
                onClick={() =>
                  download(`${config.plural}-template.csv`, config.csvExample, "text/csv")
                }
              >
                <Download />
                CSV template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  download(
                    `${config.plural}-template.json`,
                    JSON.stringify(config.jsonExample, null, 2),
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
                  <TableHead>Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, PREVIEW_ROWS).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="pl-6 text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {rowName(row) || (
                        <span className="text-destructive">Missing name</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {summarize(row, kind, tree, rows)}
                    </TableCell>
                    <TableCell className="pr-6">{row.status ?? "show"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end border-t p-4">
              <Button disabled={importing} onClick={onImport}>
                {importing && <Loader2 aria-hidden className="animate-spin" />}
                Import {rows.length} {config.plural}
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
                    <TableHead>Name</TableHead>
                    <TableHead className="pr-6">Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.failed.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="pl-6 text-muted-foreground">
                        {entry.index < 0 ? "—" : entry.index + 1}
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
                  setRows([]);
                  setFileName(null);
                }}
              >
                Import another file
              </Button>
              <Button render={<Link href={config.listHref} />} nativeButton={false}>
                View {config.plural}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
