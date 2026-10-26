"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api-error";
import { formatDateTime } from "@/lib/orders";
import { REVIEW_REPLY_MAX } from "@/lib/reviews";
import { useGetReviewQuery } from "@/store/api/review/api/reviewApi";
import type { Review } from "@/store/api/review/types";
import type { ID } from "@/types/api";

import { RatingStars } from "./rating-stars";
import { ReviewProduct } from "./review-product";
import { ReviewStatusBadge } from "./review-status-badge";
import type { ReviewPermissions } from "./use-review-actions";

type ReviewDetailProps = {
  id: ID | null;
  permissions: ReviewPermissions;
  replying: boolean;
  updatingStatus: boolean;
  onClose: () => void;
  onApprove: (review: Review) => void;
  onReject: (review: Review) => void;
  onSaveReply: (review: Review, text: string) => Promise<boolean>;
};

const replierName = (review: Review) => {
  const by = review.reply?.repliedBy;
  return by && typeof by === "object" ? by.name : "Staff";
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function ReplyForm({
  review,
  canEdit,
  replying,
  onCancel,
  onSave,
}: {
  review: Review;
  canEdit: boolean;
  replying: boolean;
  onCancel: () => void;
  onSave: (text: string) => void;
}) {
  const saved = review.reply?.text ?? "";
  const [text, setText] = useState(saved);
  const dirty = text.trim() !== saved;

  return (
    <>
      <div className="grid gap-2 px-4 pb-4">
        <Label htmlFor="review-reply">Public reply</Label>
        {review.reply && (
          <div className="text-xs text-muted-foreground">
            Last saved by {replierName(review)} on {formatDateTime(review.reply.repliedAt)}
          </div>
        )}
        <Textarea
          id="review-reply"
          value={text}
          disabled={!canEdit}
          maxLength={REVIEW_REPLY_MAX}
          onChange={(event) => setText(event.target.value)}
          placeholder="Thank the customer or answer their question. Shown under the review in the store."
          rows={5}
        />
        <div className="text-right text-xs text-muted-foreground">
          {text.length}/{REVIEW_REPLY_MAX}
        </div>
      </div>
      {canEdit && (
        <div className="sticky bottom-0 z-10 mt-auto flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80">
          <Button variant="outline" onClick={onCancel} disabled={replying}>
            Cancel
          </Button>
          <Button onClick={() => onSave(text)} disabled={replying || !dirty}>
            {replying && <Loader2 aria-hidden className="animate-spin" />}
            {saved && !text.trim() ? "Remove reply" : "Save reply"}
          </Button>
        </div>
      )}
    </>
  );
}

export function ReviewDetail({
  id,
  permissions,
  replying,
  updatingStatus,
  onClose,
  onApprove,
  onReject,
  onSaveReply,
}: ReviewDetailProps) {
  const { data: review, isLoading, error } = useGetReviewQuery(id ?? "", { skip: !id });

  const onSave = async (text: string) => {
    if (review && (await onSaveReply(review, text))) onClose();
  };

  return (
    <Sheet open={Boolean(id)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>Review</SheetTitle>
          <SheetDescription>Moderate the review and reply to the customer.</SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="grid gap-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {error && (
          <div className="p-4 text-sm text-destructive">
            {getErrorMessage(error, "Could not load the review.")}
          </div>
        )}

        {review && (
          <>
            <div className="grid gap-4 p-4">
              <ReviewProduct product={review.product} />

              <div className="flex flex-wrap items-center gap-3">
                <RatingStars rating={review.rating} className="[&_svg]:size-4" />
                <ReviewStatusBadge status={review.status} />
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(review.createdAt)}
                </span>
              </div>

              <div className="grid gap-1">
                {review.title && <div className="font-medium">{review.title}</div>}
                <p className="text-sm whitespace-pre-line">{review.comment}</p>
              </div>

              {review.status === "rejected" && review.rejectionReason && (
                <Field label="Rejection reason">{review.rejectionReason}</Field>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Customer">
                  <div>{review.user?.name ?? "Deleted customer"}</div>
                  <div className="text-xs text-muted-foreground">
                    {review.user?.email ?? review.user?.phone}
                  </div>
                </Field>
                <Field label="Order">
                  <Link href={`/orders/${review.order}`} className="hover:underline">
                    View order
                  </Link>
                </Field>
              </div>

              {permissions.canEdit && (
                <div className="flex flex-wrap gap-2">
                  {review.status !== "approved" && (
                    <Button size="sm" disabled={updatingStatus} onClick={() => onApprove(review)}>
                      <Check />
                      Approve
                    </Button>
                  )}
                  {review.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingStatus}
                      onClick={() => onReject(review)}
                    >
                      <X />
                      Reject
                    </Button>
                  )}
                </div>
              )}
            </div>

            <ReplyForm
              key={`${review._id}-${review.reply?.repliedAt ?? ""}`}
              review={review}
              canEdit={permissions.canEdit}
              replying={replying}
              onCancel={onClose}
              onSave={onSave}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
