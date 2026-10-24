"use client";

import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ROOT_PARENT } from "@/lib/validation/category-schemas";

import { useCategoryOptions } from "./category-select-field";

type MultiCategoryFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  lockedId?: string;
  description?: React.ReactNode;
  disabled?: boolean;
};

const MultiCategoryField = <T extends FieldValues>({
  control,
  name,
  label,
  lockedId,
  description,
  disabled,
}: MultiCategoryFieldProps<T>) => {
  const { options, isLoading } = useCategoryOptions();
  const { field, fieldState } = useController({ control, name });
  const selected = new Set((field.value as string[]) ?? []);
  const categories = options.filter((option) => option.value !== ROOT_PARENT);

  const toggle = (id: string, on: boolean) => {
    const next = new Set(selected);
    if (on) next.add(id);
    else next.delete(id);
    field.onChange([...next]);
  };

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel>{label}</FieldLabel>

      <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        {!isLoading && categories.length === 0 && (
          <p className="px-1 py-2 text-sm text-muted-foreground">
            No categories yet.
          </p>
        )}
        {categories.map((option) => {
          const locked = option.value === lockedId;
          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted"
            >
              <Checkbox
                checked={locked || selected.has(option.value)}
                disabled={disabled || locked}
                onCheckedChange={(checked) => toggle(option.value, checked)}
              />
              <span className="truncate">{option.label}</span>
            </label>
          );
        })}
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[fieldState.error]} />
    </Field>
  );
};

export default MultiCategoryField;
