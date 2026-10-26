import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATE_LABELS } from "@/lib/payments";
import type { PaymentState } from "@/store/api/payment/types";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const STATE_VARIANTS: Record<PaymentState, BadgeVariant> = {
  initiated: "outline",
  pending: "outline",
  paid: "default",
  failed: "destructive",
  cancelled: "secondary",
  mismatched: "destructive",
  expired: "secondary",
};

export function PaymentStateBadge({ status }: { status: PaymentState }) {
  return <Badge variant={STATE_VARIANTS[status]}>{PAYMENT_STATE_LABELS[status]}</Badge>;
}
