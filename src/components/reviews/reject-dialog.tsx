"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REVIEW_REJECTION_MAX } from "@/lib/reviews";

type RejectDialogProps = {
  open: boolean;
  count: number;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
};

export function RejectDialog({ open, count, pending, onOpenChange, onConfirm }: RejectDialogProps) {
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();

  const onChange = (next: boolean) => {
    if (!next) setReason("");
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={onChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {count === 1 ? "Reject review?" : `Reject ${count} reviews?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Rejected reviews are hidden from the store. The customer sees this reason on their
            review.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="reject-reason">Reason</Label>
          <Textarea
            id="reject-reason"
            value={reason}
            maxLength={REVIEW_REJECTION_MAX}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Contains personal information"
            rows={3}
          />
          <div className="text-right text-xs text-muted-foreground">
            {reason.length}/{REVIEW_REJECTION_MAX}
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={pending || !trimmed}
            onClick={() => onConfirm(trimmed)}
          >
            {pending && <Loader2 aria-hidden className="animate-spin" />}
            Reject
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
