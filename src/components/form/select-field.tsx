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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectOption = { label: string; value: string };

type SelectFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  description?: React.ReactNode;
  disabled?: boolean;
};

const SelectField = <T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  description,
  disabled,
}: SelectFieldProps<T>) => {
  const id = useId();
  const { field, fieldState } = useController({ control, name });

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <Select
        items={options}
        value={field.value ?? null}
        onValueChange={(value) => field.onChange(value ?? "")}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-invalid={fieldState.invalid}
          onBlur={field.onBlur}
          className="w-full data-[size=default]:h-10"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[fieldState.error]} />
    </Field>
  );
};

export default SelectField;
