"use client";

import { useWatch, type Control } from "react-hook-form";

import SelectField from "@/components/form/select-field";
import TextField from "@/components/form/text-field";
import { FieldGroup } from "@/components/ui/field";
import {
  DISCOUNT_TYPES,
  type CouponValues,
} from "@/lib/validation/coupon-schemas";

const AMOUNT_PROPS = {
  type: "number",
  min: 0,
  step: "0.01",
  inputMode: "decimal",
} as const;

export function CouponDiscountFields({ control }: { control: Control<CouponValues> }) {
  const discountType = useWatch({ control, name: "discountType" });
  const isPercentage = discountType === "percentage";

  return (
    <FieldGroup className="grid gap-6 md:grid-cols-2">
      <SelectField
        control={control}
        name="discountType"
        label="Discount type"
        options={[...DISCOUNT_TYPES]}
      />
      <TextField
        control={control}
        name="discountValue"
        label={isPercentage ? "Discount (%)" : "Discount amount"}
        placeholder={isPercentage ? "e.g. 10" : "e.g. 100"}
        {...AMOUNT_PROPS}
      />
      {isPercentage && (
        <TextField
          control={control}
          name="maxDiscountAmount"
          label="Maximum discount"
          {...AMOUNT_PROPS}
        />
      )}
      <TextField
        control={control}
        name="minimumAmount"
        label="Minimum spend"
        {...AMOUNT_PROPS}
      />
    </FieldGroup>
  );
}
