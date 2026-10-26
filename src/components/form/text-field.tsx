"use client";

import { useId } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "cn";
import type { LucideIcon } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type TextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  icon?: LucideIcon;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
} & Omit<React.ComponentProps<"input">, "name" | "defaultValue">;

const TextField = <T extends FieldValues>({
  control,
  name,
  label,
  icon: Icon,
  description,
  trailing,
  className,
  ...props
}: TextFieldProps<T>) => {
  const id = useId();
  const { field, fieldState } = useController({ control, name });

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
        )}

        <Input
          id={id}
          {...field}
          value={field.value ?? ""}
          aria-invalid={fieldState.invalid}
          className={cn("h-10", Icon && "pl-9", trailing && "pr-10", className)}
          {...props}
        />

        {trailing}
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[fieldState.error]} />
    </Field>
  );
};

export default TextField;
