"use client";

import { useState } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

import TextField from "./text-field";

type PasswordFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  icon?: LucideIcon;
  description?: React.ReactNode;
} & Omit<React.ComponentProps<"input">, "name" | "defaultValue" | "type">;

const PasswordField = <T extends FieldValues>({
  control,
  name,
  label,
  icon,
  description,
  ...props
}: PasswordFieldProps<T>) => {
  const [visible, setVisible] = useState(false);

  const Toggle = visible ? EyeOff : Eye;

  return (
    <TextField
      control={control}
      name={name}
      label={label}
      icon={icon}
      description={description}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Toggle aria-hidden className="size-4" />
        </button>
      }
      {...props}
    />
  );
};

export default PasswordField;
