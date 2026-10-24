import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/orders";
import type { OrderStatus, PaymentStatus } from "@/store/api/order/types";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const STATUS_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  pending: "outline",
  processing: "secondary",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
};

const PAYMENT_VARIANTS: Record<PaymentStatus, BadgeVariant> = {
  pending: "outline",
  paid: "default",
  refunded: "secondary",
  failed: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={PAYMENT_VARIANTS[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>
  );
}
