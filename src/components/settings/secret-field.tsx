"use client";

import { useId } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { MaskedSecret } from "@/store/api/settings/types";

type SecretFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  saved: MaskedSecret;
  disabled?: boolean;
};

const SecretField = <T extends FieldValues>({
  control,
  name,
  label,
  saved,
  disabled,
}: SecretFieldProps<T>) => {
  const id = useId();
  const { field } = useController({ control, name });
  const cleared = field.value === null;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex gap-2">
        <Input
          id={id}
          type="password"
          autoComplete="new-password"
          {...field}
          value={cleared ? "" : (field.value ?? "")}
          disabled={disabled || cleared}
          placeholder={
            cleared ? "Will be removed on save" : saved.isSet ? saved.hint : "Not set"
          }
          className="h-10"
          onChange={(event) => field.onChange(event.target.value)}
        />
        {saved.isSet && (
          <Button
            type="button"
            variant="outline"
            className="h-10"
            disabled={disabled}
            onClick={() => field.onChange(cleared ? "" : null)}
          >
            {cleared ? "Undo" : "Remove"}
          </Button>
        )}
      </div>
      <FieldDescription>
        {saved.isSet
          ? "Saved. Leave blank to keep the current secret."
          : "Paste the secret from the provider console."}
      </FieldDescription>
    </Field>
  );
};

export default SecretField;
