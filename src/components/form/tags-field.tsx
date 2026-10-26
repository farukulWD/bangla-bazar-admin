"use client";

import { useId, useState } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type TagsFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: React.ReactNode;
  disabled?: boolean;
};

const TagsField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  disabled,
}: TagsFieldProps<T>) => {
  const id = useId();
  const [draft, setDraft] = useState("");
  const { field, fieldState } = useController({ control, name });
  const tags = (field.value as string[]) ?? [];

  const commit = () => {
    const taken = new Set(tags.map((tag) => tag.toLowerCase()));
    const added = draft
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => {
        const key = tag.toLowerCase();
        if (!tag || taken.has(key)) return false;
        taken.add(key);
        return true;
      });
    if (added.length) field.onChange([...tags, ...added]);
    setDraft("");
  };

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <Input
        id={id}
        value={draft}
        disabled={disabled}
        placeholder={placeholder}
        className="h-10"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          commit();
          field.onBlur();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit();
          } else if (event.key === "Backspace" && !draft && tags.length) {
            field.onChange(tags.slice(0, -1));
          }
        }}
      />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="h-6 gap-1 pr-1">
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                disabled={disabled}
                className="rounded-sm p-0.5 hover:bg-background"
                onClick={() => field.onChange(tags.filter((item) => item !== tag))}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[fieldState.error]} />
    </Field>
  );
};

export default TagsField;
