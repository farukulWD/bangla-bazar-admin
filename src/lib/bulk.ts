import { toast } from "sonner";

import type { BulkResult } from "@/store/api/category/types";

export const reportBulkResult = (
  result: BulkResult,
  success: (count: number) => string,
) => {
  if (result.succeeded > 0) toast.success(success(result.succeeded));
  if (result.failed.length > 0) {
    toast.error(result.failed.map((entry) => entry.error).join(" · "));
  }
};

export const toggleInSet = (set: Set<string>, id: string, on: boolean) => {
  const next = new Set(set);
  if (on) next.add(id);
  else next.delete(id);
  return next;
};
