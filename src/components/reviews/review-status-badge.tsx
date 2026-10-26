import { Badge } from "@/components/ui/badge";
import { REVIEW_STATUS_LABELS } from "@/lib/reviews";
import type { ReviewStatus } from "@/store/api/review/types";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const STATUS_VARIANTS: Record<ReviewStatus, BadgeVariant> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{REVIEW_STATUS_LABELS[status]}</Badge>;
}
