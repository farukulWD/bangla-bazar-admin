"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BulkActionBar } from "@/components/layout/bulk-action-bar";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api-error";
import { reportBulkResult } from "@/lib/bulk";
import {
  useBulkDeleteCouponsMutation,
  useBulkUpdateCouponsMutation,
} from "@/store/api/coupon/api/couponApi";
import type { CouponStatus } from "@/store/api/coupon/types";
import type { ID } from "@/types/api";

const plural = (count: number) => `coupon${count === 1 ? "" : "s"}`;

type CouponBulkActionsProps = {
  selectedIds: ID[];
  canPublish: boolean;
  canDelete: boolean;
  onClear: () => void;
};

export function CouponBulkActions({
  selectedIds,
  canPublish,
  canDelete,
  onClear,
}: CouponBulkActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkUpdate, { isLoading: updating }] = useBulkUpdateCouponsMutation();
  const [bulkDelete, { isLoading: deleting }] = useBulkDeleteCouponsMutation();
  const count = selectedIds.length;

  const onSetStatus = async (status: CouponStatus) => {
    try {
      const result = await bulkUpdate({ ids: selectedIds, status }).unwrap();
      reportBulkResult(
        result,
        (done) => `${done} ${plural(done)} ${status === "show" ? "shown" : "hidden"}.`,
      );
      onClear();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the coupons."));
    }
  };

  const onDelete = async () => {
    try {
      const result = await bulkDelete(selectedIds).unwrap();
      reportBulkResult(result, (done) => `${done} ${plural(done)} deleted.`);
      onClear();
      setConfirmOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the coupons."));
    }
  };

  return (
    <>
      <BulkActionBar count={count} noun="coupon" onClear={onClear}>
        {canPublish && (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => onSetStatus("show")}
            >
              <Eye />
              Show
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => onSetStatus("hide")}
            >
              <EyeOff />
              Hide
            </Button>
          </>
        )}
        {canDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 />
            Delete
          </Button>
        )}
      </BulkActionBar>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${count} ${plural(count)}?`}
        description="Shoppers will no longer be able to use these codes."
        pending={deleting}
        onConfirm={onDelete}
      />
    </>
  );
}
