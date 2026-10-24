"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "cn";
import { ImagePlus, Star, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { ImageValue } from "@/lib/validation/category-schemas";

const MAX_BYTES = 10 * 1024 * 1024;

type MultiImageFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  max: number;
  description?: React.ReactNode;
  disabled?: boolean;
};

const MultiImageField = <T extends FieldValues>({
  control,
  name,
  label,
  max,
  description,
  disabled,
}: MultiImageFieldProps<T>) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { field, fieldState } = useController({ control, name });
  const images = useMemo(
    () => (field.value as ImageValue[] | undefined) ?? [],
    [field.value],
  );

  const previews = useMemo(
    () =>
      images.map((image) =>
        image.file ? URL.createObjectURL(image.file) : image.url,
      ),
    [images],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview, index) => {
        if (images[index]?.file) URL.revokeObjectURL(preview);
      });
    };
  }, [previews, images]);

  const add = (list: FileList | null | undefined) => {
    if (!list || list.length === 0) return;
    const files = [...list];
    const invalid = files.find(
      (file) => !file.type.startsWith("image/") || file.size > MAX_BYTES,
    );
    if (invalid) {
      setLocalError(
        invalid.type.startsWith("image/")
          ? `${invalid.name} is larger than 10 MB.`
          : `${invalid.name} is not an image.`,
      );
      return;
    }

    const room = max - images.length;
    if (room <= 0) {
      setLocalError(`A product can have up to ${max} images.`);
      return;
    }

    setLocalError(
      files.length > room ? `Only ${room} more image${room === 1 ? "" : "s"} added.` : null,
    );
    field.onChange([
      ...images,
      ...files.slice(0, room).map((file) => ({ file, url: "" })),
    ]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (index: number) => {
    setLocalError(null);
    field.onChange(images.filter((_, position) => position !== index));
  };

  const makeCover = (index: number) => {
    const next = [...images];
    const [picked] = next.splice(index, 1);
    field.onChange([picked, ...next]);
  };

  const full = images.length >= max;

  return (
    <Field data-invalid={fieldState.invalid || Boolean(localError)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={`${image.url}-${image.file?.name ?? ""}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previews[index]} alt="" className="size-full object-cover" />
            {index === 0 && !image.file && (
              <Badge className="absolute bottom-1 left-1">Cover</Badge>
            )}
            {image.file && (
              <Badge variant="secondary" className="absolute bottom-1 left-1">
                New
              </Badge>
            )}
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              {index > 0 && !image.file && (
                <button
                  type="button"
                  aria-label="Use as cover"
                  disabled={disabled}
                  onClick={() => makeCover(index)}
                  className="rounded-md bg-background/90 p-1 shadow-sm hover:bg-background"
                >
                  <Star className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                aria-label="Remove image"
                disabled={disabled}
                onClick={() => remove(index)}
                className="rounded-md bg-background/90 p-1 shadow-sm hover:bg-background"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        {!full && (
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
              add(event.dataTransfer.files);
            }}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/40 text-xs text-muted-foreground transition-colors hover:border-ring hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
              dragging && "border-ring bg-muted",
            )}
          >
            <ImagePlus aria-hidden className="size-6" />
            Add images
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => add(event.target.files)}
      />

      <FieldDescription>
        {images.length} of {max}. PNG, JPG or WEBP, up to 10 MB each. New uploads
        are added after the saved images.
      </FieldDescription>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError
        errors={[localError ? { message: localError } : fieldState.error]}
      />
    </Field>
  );
};

export default MultiImageField;
