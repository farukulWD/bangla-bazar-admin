import { Badge } from "@/components/ui/badge";
import { couponState, type CouponState } from "@/lib/coupons";
import type { Coupon } from "@/store/api/coupon/types";

const BADGES: Record<
  CouponState,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  active: { label: "Active", variant: "default" },
  scheduled: { label: "Scheduled", variant: "secondary" },
  expired: { label: "Expired", variant: "destructive" },
  hidden: { label: "Hidden", variant: "outline" },
};

export function CouponStateBadge({ coupon }: { coupon: Coupon }) {
  const badge = BADGES[couponState(coupon)];
  return <Badge variant={badge.variant}>{badge.label}</Badge>;
}
