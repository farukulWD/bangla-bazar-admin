"use client";

import { useState } from "react";
import { CheckCircle2, Download, Loader2 } from "lucide-react";

import { useCategoryOptions } from "@/components/form/category-select-field";
import FormAlert from "@/components/form/form-alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductJob } from "@/hooks/use-product-job";
import { getErrorMessage } from "@/lib/api-error";
import { ROOT_PARENT } from "@/lib/validation/category-schemas";
import { useExportProductsMutation } from "@/store/api/product/api/productApi";
import type { ExportJobResult, ProductStatus } from "@/store/api/product/types";

const ALL = "all";

const STATUSES = [
  { label: "All statuses", value: ALL },
  { label: "Showing only", value: "show" },
  { label: "Hidden only", value: "hide" },
];

type ExportProductsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExportProductsDialog({
  open,
  onOpenChange,
}: ExportProductsDialogProps) {
  const { options } = useCategoryOptions();
  const categories = [
    { label: "All categories", value: ALL },
    ...options.filter((option) => option.value !== ROOT_PARENT),
  ];
  const [status, setStatus] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<ExportJobResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [exportProducts, { isLoading: starting }] = useExportProductsMutation();
  const { job, error, done } = useProductJob(jobId);

  if (jobId && done) {
    setJobId(null);
    if (job?.state === "completed" && job.result) {
      setResult(job.result as ExportJobResult);
    } else {
      setMessage(
        job?.failedReason ?? getErrorMessage(error, "The export failed."),
      );
    }
  }

  const running = starting || Boolean(jobId);

  const start = async () => {
    setResult(null);
    setMessage(null);
    try {
      const { jobId: id } = await exportProducts({
        status: status === ALL ? undefined : (status as ProductStatus),
        category: category === ALL ? undefined : category,
      }).unwrap();
      setJobId(id);
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not start the export."));
    }
  };

  const close = (next: boolean) => {
    if (running) return;
    if (!next) {
      setResult(null);
      setMessage(null);
    }
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={close}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Export products</AlertDialogTitle>
          <AlertDialogDescription>
            Builds a JSON file you can edit and import again.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              [STATUSES, status, setStatus],
              [categories, category, setCategory],
            ] as const
          ).map(([items, value, onChange], index) => (
            <Select
              key={index}
              items={items}
              value={value}
              disabled={running}
              onValueChange={(next) => onChange(next ?? ALL)}
            >
              <SelectTrigger className="h-10 w-full">
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
          ))}
        </div>

        <FormAlert message={message} />

        {result && (
          <p className="flex items-center gap-2 text-sm">
            <CheckCircle2 aria-hidden className="size-4 text-primary" />
            {result.count} product{result.count === 1 ? "" : "s"} exported.
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={running}>Close</AlertDialogCancel>
          {result ? (
            <Button
              render={<a href={result.url} target="_blank" rel="noreferrer" />}
              nativeButton={false}
            >
              <Download />
              Download file
            </Button>
          ) : (
            <Button disabled={running} onClick={start}>
              {running && <Loader2 aria-hidden className="animate-spin" />}
              {jobId ? "Preparing…" : "Export"}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
