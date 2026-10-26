import { Check, Eye, MoreHorizontal, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/orders";
import type { Review } from "@/store/api/review/types";

import { RatingStars } from "./rating-stars";
import { ReviewProduct } from "./review-product";
import { ReviewStatusBadge } from "./review-status-badge";
import type { ReviewPermissions } from "./use-review-actions";

type ReviewRowProps = {
  review: Review;
  permissions: ReviewPermissions;
  selectable: boolean;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onOpen: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
};

export function ReviewRow({
  review,
  permissions,
  selectable,
  selected,
  onSelect,
  onOpen,
  onApprove,
  onReject,
  onDelete,
}: ReviewRowProps) {
  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell className="w-10 pl-4">
        {selectable && (
          <Checkbox aria-label="Select review" checked={selected} onCheckedChange={onSelect} />
        )}
      </TableCell>
      <TableCell className="max-w-56">
        <ReviewProduct product={review.product} />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="font-medium">{review.user?.name ?? "Deleted customer"}</div>
        <div className="text-xs text-muted-foreground">{review.user?.email}</div>
      </TableCell>
      <TableCell className="max-w-xs">
        <RatingStars rating={review.rating} />
        <button
          type="button"
          onClick={onOpen}
          className="mt-1 line-clamp-2 text-left text-sm hover:underline"
        >
          {review.title ? <span className="font-medium">{review.title} · </span> : null}
          {review.comment}
        </button>
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {formatDateTime(review.createdAt)}
      </TableCell>
      <TableCell>
        <ReviewStatusBadge status={review.status} />
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Review actions" />}
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onOpen}>
                  <Eye />
                  View and reply
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {permissions.canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {review.status !== "approved" && (
                      <DropdownMenuItem onClick={onApprove}>
                        <Check />
                        Approve
                      </DropdownMenuItem>
                    )}
                    {review.status !== "rejected" && (
                      <DropdownMenuItem onClick={onReject}>
                        <X />
                        Reject
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </>
              )}
              {permissions.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2 />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
