import type { ReviewStatus } from "@/store/api/review/types";

export const REVIEW_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const REVIEW_RATINGS = ["5", "4", "3", "2", "1"] as const;

export const REVIEW_REJECTION_MAX = 300;
export const REVIEW_REPLY_MAX = 1000;
