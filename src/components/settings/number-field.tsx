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
import { Input } from "@/components/ui/input";

type NumberFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
};

const NumberField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  min,
  max,
  step,
}: NumberFieldProps<T>) => {
  const id = useId();
  const { field, fieldState } = useController({ control, name });

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        {...field}
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(field.value) ? field.value : ""}
        aria-invalid={fieldState.invalid}
        className="h-10"
        onChange={(event) =>
          field.onChange(
            event.target.value === "" ? Number.NaN : event.target.valueAsNumber,
          )
        }
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[fieldState.error]} />
    </Field>
  );
};

export default NumberField;
