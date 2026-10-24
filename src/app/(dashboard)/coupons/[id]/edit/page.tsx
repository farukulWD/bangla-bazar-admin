import type { Metadata } from "next";

import { EditCoupon } from "@/components/coupons/edit-coupon";

export const metadata: Metadata = {
  title: "Edit Coupon | Bangla Bazar Admin",
};

export default function EditCouponPage() {
  return <EditCoupon />;
}
