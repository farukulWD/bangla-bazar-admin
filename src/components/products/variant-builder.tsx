"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { Layers, Trash2, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ProductValues,
  VariantValue,
} from "@/lib/validation/product-schemas";
import { useGetShowingAttributesQuery } from "@/store/api/attribute/api/attributeApi";
import type { Attribute } from "@/store/api/attribute/types";
import type { VariantOption } from "@/store/api/product/types";

const NO_IMAGE = "none";

export const variantKey = (options: VariantOption[]) =>
  options
    .map((option) => `${option.attributeId}:${option.valueId}`)
    .sort()
    .join("|");

export const variantLabel = (options: VariantOption[], attributes: Attribute[]) =>
  options
    .map((option) => {
      const attribute = attributes.find((item) => item._id === option.attributeId);
      const value = attribute?.values.find((item) => item._id === option.valueId);
      return value?.name ?? "Unavailable";
    })
    .join(" / ");

const combine = (groups: VariantOption[][]): VariantOption[][] =>
  groups.reduce<VariantOption[][]>(
    (rows, group) => rows.flatMap((row) => group.map((option) => [...row, option])),
    [[]],
  );

const initialSelection = (variants: VariantValue[]) => {
  const selection: Record<string, string[]> = {};
  variants.forEach((variant) =>
    variant.options.forEach(({ attributeId, valueId }) => {
      const values = (selection[attributeId] ??= []);
      if (!values.includes(valueId)) values.push(valueId);
    }),
  );
  return selection;
};

type VariantBuilderProps = {
  form: UseFormReturn<ProductValues>;
};

export function VariantBuilder({ form }: VariantBuilderProps) {
  const { data = [], isLoading } = useGetShowingAttributesQuery();
  const attributes = useMemo(
    () => data.filter((attribute) => attribute.type === "attribute"),
    [data],
  );
  const variants = useFieldArray({ control: form.control, name: "variants" });
  const [selection, setSelection] = useState(() =>
    initialSelection(form.getValues("variants")),
  );
  const [bulk, setBulk] = useState({ originalPrice: "", price: "", stock: "" });

  const images = useWatch({ control: form.control, name: "images" });
  const imageOptions = [
    { label: "No image", value: NO_IMAGE },
    ...images
      .filter((image) => !image.file && image.url)
      .map((image, index) => ({ label: `Image ${index + 1}`, value: image.url })),
  ];
  const errors = form.formState.errors.variants;

  const toggleValue = (attributeId: string, valueId: string) =>
    setSelection((current) => {
      const values = current[attributeId] ?? [];
      return {
        ...current,
        [attributeId]: values.includes(valueId)
          ? values.filter((id) => id !== valueId)
          : [...values, valueId],
      };
    });

  const generate = () => {
    const groups = attributes
      .map((attribute) =>
        (selection[attribute._id] ?? []).map((valueId) => ({
          attributeId: attribute._id,
          valueId,
        })),
      )
      .filter((group) => group.length > 0);
    if (groups.length === 0) return;

    const existing = new Map(
      form.getValues("variants").map((variant) => [variant.key, variant]),
    );
    const originalPrice = form.getValues("originalPrice");
    const price = form.getValues("price");

    variants.replace(
      combine(groups).map((options) => {
        const key = variantKey(options);
        return (
          existing.get(key) ?? {
            key,
            options,
            sku: "",
            barcode: "",
            originalPrice,
            price,
            stock: "0",
            image: "",
          }
        );
      }),
    );
    form.clearErrors("variants");
  };

  const applyToAll = () => {
    form.getValues("variants").forEach((_, index) => {
      (["originalPrice", "price", "stock"] as const).forEach((field) => {
        if (bulk[field] !== "") {
          form.setValue(`variants.${index}.${field}`, bulk[field], {
            shouldDirty: true,
          });
        }
      });
    });
    setBulk({ originalPrice: "", price: "", stock: "" });
  };

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  if (attributes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No showing attributes yet. Create an attribute such as Size or Colour
        first.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {attributes.map((attribute) => (
          <div key={attribute._id} className="space-y-2">
            <p className="text-sm font-medium">{attribute.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {attribute.values.map((value) => {
                const active = (selection[attribute._id] ?? []).includes(value._id);
                return (
                  <button
                    key={value._id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleValue(attribute._id, value._id)}
                  >
                    <Badge
                      variant={active ? "default" : "outline"}
                      className="h-7 cursor-pointer px-2.5 text-sm"
                    >
                      {value.name}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={generate}>
          <Wand2 />
          Generate variants
        </Button>
        <p className="text-xs text-muted-foreground">
          Generating keeps rows that already exist and their prices. Combinations
          no longer selected are removed when you save.
        </p>
      </div>

      <FieldError
        errors={[errors?.root, errors?.message ? { message: errors.message } : undefined]}
      />

      {variants.fields.length > 0 && (
        <>
          <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-muted/40 p-3">
            <Layers aria-hidden className="mb-2 size-4 text-muted-foreground" />
            {(
              [
                ["originalPrice", "Original price"],
                ["price", "Sale price"],
                ["stock", "Stock"],
              ] as const
            ).map(([field, label]) => (
              <Input
                key={field}
                type="number"
                min={0}
                placeholder={label}
                value={bulk[field]}
                onChange={(event) =>
                  setBulk((current) => ({ ...current, [field]: event.target.value }))
                }
                className="h-8 w-32"
              />
            ))}
            <Button type="button" size="sm" variant="secondary" onClick={applyToAll}>
              Apply to all
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-3">Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="hidden 2xl:table-cell">Barcode</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>Sale</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="pr-3" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.fields.map((field, index) => {
                  const rowErrors = errors?.[index];
                  const image = form.watch(`variants.${index}.image`);
                  const label = variantLabel(field.options, attributes);
                  return (
                    <TableRow key={field.id}>
                      <TableCell className="pl-3 font-medium whitespace-nowrap">
                        {label}
                        {!field._id && (
                          <Badge variant="secondary" className="ml-2">
                            New
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          {...form.register(`variants.${index}.sku`)}
                          aria-invalid={Boolean(rowErrors?.sku)}
                          className="h-8 w-28"
                        />
                      </TableCell>
                      <TableCell className="hidden 2xl:table-cell">
                        <Input
                          {...form.register(`variants.${index}.barcode`)}
                          aria-invalid={Boolean(rowErrors?.barcode)}
                          className="h-8 w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...form.register(`variants.${index}.originalPrice`)}
                          aria-invalid={Boolean(rowErrors?.originalPrice)}
                          className="h-8 w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...form.register(`variants.${index}.price`)}
                          aria-invalid={Boolean(rowErrors?.price)}
                          title={rowErrors?.price?.message}
                          className="h-8 w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step="1"
                          {...form.register(`variants.${index}.stock`)}
                          aria-invalid={Boolean(rowErrors?.stock)}
                          className="h-8 w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          items={imageOptions}
                          value={image || NO_IMAGE}
                          onValueChange={(value) =>
                            form.setValue(
                              `variants.${index}.image`,
                              !value || value === NO_IMAGE ? "" : value,
                              { shouldDirty: true },
                            )
                          }
                        >
                          <SelectTrigger size="sm" className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {imageOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.value !== NO_IMAGE && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={option.value}
                                    alt=""
                                    className="size-5 rounded object-cover"
                                  />
                                )}
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="pr-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove ${label}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => variants.remove(index)}
                        >
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {Array.isArray(errors) && errors.some(Boolean) && (
            <p className="text-sm text-destructive">
              Fix the highlighted variant fields. Sale price cannot exceed the
              original price.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Variant images come from the saved product images. Save new uploads
            first to pick them here.
          </p>
        </>
      )}
    </div>
  );
}
