import type { Control } from "react-hook-form";

import TextField from "@/components/form/text-field";
import { FieldGroup } from "@/components/ui/field";
import type { CouponValues } from "@/lib/validation/coupon-schemas";

export function CouponScheduleFields({ control }: { control: Control<CouponValues> }) {
  return (
    <FieldGroup className="grid gap-6 md:grid-cols-2">
      <TextField
        control={control}
        name="startTime"
        label="Starts"
        type="datetime-local"
      />
      <TextField
        control={control}
        name="endTime"
        label="Ends"
        type="datetime-local"
      />
    </FieldGroup>
  );
}
