import { z } from "zod";

import { imageValueSchema } from "@/lib/validation/category-schemas";

export const DISCOUNT_TYPES = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed amount", value: "fixed" },
] as const;

const isAmount = (value: string) =>
  Number.isFinite(Number(value)) && Number(value) >= 0;

const optionalAmount = z
  .string()
  .trim()
  .refine((value) => value === "" || isAmount(value), "Enter a valid amount");

export const couponSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Coupon title is required")
      .max(120, "Coupon title is too long"),
    couponCode: z
      .string()
      .trim()
      .min(1, "Coupon code is required")
      .max(32, "Coupon code is too long")
      .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, hyphens or underscores only"),
    logo: imageValueSchema,
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z
      .string()
      .trim()
      .min(1, "Discount is required")
      .refine((value) => isAmount(value) && Number(value) > 0, "Discount must be greater than 0"),
    maxDiscountAmount: optionalAmount,
    minimumAmount: optionalAmount,
    startTime: z.string(),
    endTime: z.string().min(1, "End date is required"),
    status: z.enum(["show", "hide"]),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === "percentage" && Number(data.discountValue) > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "A percentage discount cannot be more than 100",
      });
    }
    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "The coupon must end after it starts",
      });
    }
  });

export type CouponValues = z.infer<typeof couponSchema>;
