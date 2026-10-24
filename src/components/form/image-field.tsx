"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "cn";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { ImageValue } from "@/lib/validation/category-schemas";

const MAX_BYTES = 10 * 1024 * 1024;

type ImageFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: React.ReactNode;
  disabled?: boolean;
};

const ImageField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
}: ImageFieldProps<T>) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { field, fieldState } = useController({ control, name });
  const value = field.value as ImageValue;

  const objectUrl = useMemo(
    () => (value.file ? URL.createObjectURL(value.file) : null),
    [value.file],
  );

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const preview = objectUrl ?? (value.url || null);

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLocalError("Choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("Image must be 10 MB or smaller.");
      return;
    }
    setLocalError(null);
    field.onChange({ ...value, file });
  };

  const clear = () => {
    setLocalError(null);
    field.onChange({ file: null, url: "" });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Field data-invalid={fieldState.invalid || Boolean(localError)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <div className="flex items-start gap-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pick(event.dataTransfer.files[0]);
          }}
          className={cn(
            "relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40 text-muted-foreground transition-colors hover:border-ring hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
            dragging && "border-ring bg-muted",
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus aria-hidden className="size-6" />
          )}
        </button>

        <div className="space-y-2 pt-1 text-sm">
          <p className="text-muted-foreground">
            Drop an image here or click to choose. PNG, JPG, WEBP or SVG, up to
            10 MB.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              {preview ? "Replace" : "Choose image"}
            </Button>
            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={clear}
              >
                <X />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => pick(event.target.files?.[0])}
      />

      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError
        errors={[localError ? { message: localError } : fieldState.error]}
      />
    </Field>
  );
};

export default ImageField;
