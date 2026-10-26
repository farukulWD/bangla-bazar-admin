import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useBulkDeleteReviewsMutation,
  useBulkUpdateReviewStatusMutation,
  useDeleteReviewMutation,
  useReplyToReviewMutation,
  useUpdateReviewStatusMutation,
} from "@/store/api/review/api/reviewApi";
import type { Review, ReviewStatus } from "@/store/api/review/types";
import type { ID } from "@/types/api";

export type ReviewPermissions = {
  canEdit: boolean;
  canDelete: boolean;
};

const plural = (count: number) => `review${count === 1 ? "" : "s"}`;

const STATUS_DONE: Record<ReviewStatus, string> = {
  pending: "moved back to pending",
  approved: "approved",
  rejected: "rejected",
};

export function useReviewActions() {
  const { user: me } = useSession();
  const permissions: ReviewPermissions = {
    canEdit: can(me, "review", "can_edit_review"),
    canDelete: can(me, "review", "can_delete_review"),
  };

  const [updateStatus, { isLoading: updatingStatus }] = useUpdateReviewStatusMutation();
  const [bulkStatus, { isLoading: bulkUpdating }] = useBulkUpdateReviewStatusMutation();
  const [reply, { isLoading: replying }] = useReplyToReviewMutation();
  const [remove, { isLoading: deleting }] = useDeleteReviewMutation();
  const [bulkRemove, { isLoading: bulkDeleting }] = useBulkDeleteReviewsMutation();

  const setStatus = async (id: ID, status: ReviewStatus, rejectionReason?: string) => {
    try {
      await updateStatus({ id, status, rejectionReason }).unwrap();
      toast.success(`Review ${STATUS_DONE[status]}.`);
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the review status."));
      return false;
    }
  };

  const setStatusMany = async (ids: ID[], status: ReviewStatus, rejectionReason?: string) => {
    try {
      const { modified } = await bulkStatus({ ids, status, rejectionReason }).unwrap();
      toast.success(`${modified} ${plural(modified)} ${STATUS_DONE[status]}.`);
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the reviews."));
      return false;
    }
  };

  const saveReply = async (review: Review, text: string) => {
    try {
      await reply({ id: review._id, text }).unwrap();
      toast.success(text.trim() ? "Reply saved." : "Reply removed.");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the reply."));
      return false;
    }
  };

  const deleteReview = async (id: ID) => {
    try {
      await remove(id).unwrap();
      toast.success("Review deleted.");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the review."));
      return false;
    }
  };

  const deleteMany = async (ids: ID[]) => {
    try {
      const { deleted } = await bulkRemove(ids).unwrap();
      toast.success(`${deleted} ${plural(deleted)} deleted.`);
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the reviews."));
      return false;
    }
  };

  return {
    permissions,
    setStatus,
    setStatusMany,
    saveReply,
    deleteReview,
    deleteMany,
    updatingStatus: updatingStatus || bulkUpdating,
    replying,
    deleting: deleting || bulkDeleting,
  };
}
