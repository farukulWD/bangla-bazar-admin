"use client";

import { useId, useRef, useState } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { storeUrl } from "@/config/nav";
import { getErrorMessage } from "@/lib/api-error";
import { useUploadSettingsAssetMutation } from "@/store/api/settings/api/settingsApi";

const MAX_BYTES = 10 * 1024 * 1024;

const previewUrl = (url: string) =>
  url.startsWith("/") && /^https?:\/\//.test(storeUrl)
    ? new URL(url, storeUrl).href
    : url;

type UploadImageFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: React.ReactNode;
  disabled?: boolean;
};

const UploadImageField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
}: UploadImageFieldProps<T>) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { field, fieldState } = useController({ control, name });
  const [upload, { isLoading: uploading }] = useUploadSettingsAssetMutation();
  const url = (field.value as string) ?? "";
  const locked = disabled || uploading;

  const pick = async (file: File | undefined) => {
    if (inputRef.current) inputRef.current.value = "";
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

    const data = new FormData();
    data.append("file", file);

    try {
      const result = await upload(data).unwrap();
      field.onChange(result.url);
    } catch (error) {
      setLocalError(getErrorMessage(error, "Upload failed. Try again."));
    }
  };

  return (
    <Field data-invalid={fieldState.invalid || Boolean(localError)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <div className="flex items-start gap-4">
        <button
          type="button"
          disabled={locked}
          onClick={() => inputRef.current?.click()}
          className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40 text-muted-foreground transition-colors hover:border-ring hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 aria-hidden className="size-5 animate-spin" />
          ) : url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl(url)} alt="" className="size-full object-contain" />
          ) : (
            <ImagePlus aria-hidden className="size-6" />
          )}
        </button>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={locked}
            onClick={() => inputRef.current?.click()}
          >
            {url ? "Replace" : "Upload"}
          </Button>
          {url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={locked}
              onClick={() => {
                setLocalError(null);
                field.onChange("");
              }}
            >
              <X />
              Remove
            </Button>
          )}
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

export default UploadImageField;
