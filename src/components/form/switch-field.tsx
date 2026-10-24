"use client";

import { useId } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

type SwitchFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: React.ReactNode;
  checkedValue?: unknown;
  uncheckedValue?: unknown;
  disabled?: boolean;
};

const SwitchField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  checkedValue = true,
  uncheckedValue = false,
  disabled,
}: SwitchFieldProps<T>) => {
  const id = useId();
  const { field } = useController({ control, name });

  return (
    <Field orientation="horizontal">
      <Switch
        id={id}
        checked={field.value === checkedValue}
        onCheckedChange={(checked) =>
          field.onChange(checked ? checkedValue : uncheckedValue)
        }
        disabled={disabled}
      />
      <div className="space-y-0.5">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </div>
    </Field>
  );
};

export default SwitchField;
