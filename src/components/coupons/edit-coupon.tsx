"use client";

import { useParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-error";
import { useGetCouponQuery } from "@/store/api/coupon/api/couponApi";

import { CouponForm } from "./coupon-form";

export function EditCoupon() {
  const { id } = useParams<{ id: string }>();
  const { data: coupon, isLoading, error } = useGetCouponQuery(id);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Coupon not found.")}
      </p>
    );
  }

  return <CouponForm key={coupon._id + coupon.updatedAt} coupon={coupon} />;
}
