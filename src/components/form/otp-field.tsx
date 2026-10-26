"use client";

import { useId } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const SLOTS = [0, 1, 2, 3, 4, 5];

type OtpFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: React.ReactNode;
  disabled?: boolean;
  onComplete?: (code: string) => void;
};

const OtpField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  onComplete,
}: OtpFieldProps<T>) => {
  const id = useId();
  const { field, fieldState } = useController({ control, name });

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <InputOTP
        id={id}
        maxLength={6}
        disabled={disabled}
        autoComplete="one-time-code"
        inputMode="numeric"
        value={field.value ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        onComplete={onComplete}
        containerClassName="justify-center"
      >
        <InputOTPGroup aria-invalid={fieldState.invalid}>
          {SLOTS.map((slot) => (
            <InputOTPSlot
              key={slot}
              index={slot}
              className="size-11 text-base"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {description && (
        <FieldDescription className="text-center">
          {description}
        </FieldDescription>
      )}
      <FieldError className="text-center" errors={[fieldState.error]} />
    </Field>
  );
};

export default OtpField;
