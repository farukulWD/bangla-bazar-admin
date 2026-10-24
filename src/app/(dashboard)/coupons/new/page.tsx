import type { Metadata } from "next";

import { CouponForm } from "@/components/coupons/coupon-form";

export const metadata: Metadata = {
  title: "New Coupon | Bangla Bazar Admin",
};

export default function NewCouponPage() {
  return <CouponForm />;
}
