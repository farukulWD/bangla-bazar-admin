"use client";

import { useState } from "react";
import { Power, PowerOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BulkActionBar } from "@/components/layout/bulk-action-bar";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api-error";
import { reportBulkResult } from "@/lib/bulk";
import type { UserStatus } from "@/store/api/auth/types";
import {
  useBulkDeleteCustomersMutation,
  useBulkSetCustomerStatusMutation,
} from "@/store/api/user/api/userApi";
import type { ID } from "@/types/api";

const plural = (count: number) => `customer${count === 1 ? "" : "s"}`;

type CustomerBulkActionsProps = {
  selectedIds: ID[];
  canToggle: boolean;
  canDelete: boolean;
  onClear: () => void;
};

export function CustomerBulkActions({
  selectedIds,
  canToggle,
  canDelete,
  onClear,
}: CustomerBulkActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkStatus, { isLoading: updating }] = useBulkSetCustomerStatusMutation();
  const [bulkDelete, { isLoading: deleting }] = useBulkDeleteCustomersMutation();
  const count = selectedIds.length;

  const onSetStatus = async (status: UserStatus) => {
    try {
      const result = await bulkStatus({ ids: selectedIds, status }).unwrap();
      reportBulkResult(
        result,
        (done) =>
          `${done} ${plural(done)} ${status === "active" ? "activated" : "deactivated"}.`,
      );
      onClear();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the customers."));
    }
  };

  const onDelete = async () => {
    try {
      const result = await bulkDelete(selectedIds).unwrap();
      reportBulkResult(result, (done) => `${done} ${plural(done)} deleted.`);
      onClear();
      setConfirmOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the customers."));
    }
  };

  return (
    <>
      <BulkActionBar count={count} noun="customer" onClear={onClear}>
        {canToggle && (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => onSetStatus("active")}
            >
              <Power />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => onSetStatus("inactive")}
            >
              <PowerOff />
              Deactivate
            </Button>
          </>
        )}
        {canDelete && (
          <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
            <Trash2 />
            Delete
          </Button>
        )}
      </BulkActionBar>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${count} ${plural(count)}?`}
        description="Their accounts will be deactivated and removed from this list. Their past orders are kept."
        pending={deleting}
        onConfirm={onDelete}
      />
    </>
  );
}
