import { z } from "zod";

import { imageValueSchema } from "@/lib/validation/category-schemas";

export const DEFAULT_IMAGE_LIMIT = 5;
export const UPLOAD_IMAGE_LIMIT = 10;

const amount = z
  .string()
  .trim()
  .min(1, "Required")
  .refine(
    (value) => Number.isFinite(Number(value)) && Number(value) >= 0,
    "Enter a valid amount",
  );

const quantity = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || (Number.isInteger(Number(value)) && Number(value) >= 0),
    "Enter a whole number",
  );

const code = z.string().trim().max(64, "Use 64 characters or fewer");

export const variantValueSchema = z.object({
  _id: z.string().optional(),
  key: z.string(),
  options: z.array(z.object({ attributeId: z.string(), valueId: z.string() })),
  sku: code,
  barcode: code,
  originalPrice: amount,
  price: amount,
  stock: quantity,
  image: z.string(),
});

const priceAbove = (price: string, originalPrice: string) =>
  Number(price) > Number(originalPrice);

export const createProductSchema = (imageLimit: number) =>
  z
    .object({
      title: z.string().trim().min(1, "Product title is required"),
      slug: z
        .string()
        .trim()
        .regex(/^[a-z0-9-]*$/i, "Use letters, numbers and hyphens only"),
      description: z.string().trim(),
      sku: code,
      barcode: code,
      category: z.string().min(1, "Choose a primary category"),
      categories: z.array(z.string()),
      tags: z.array(z.string()),
      originalPrice: amount,
      price: amount,
      stock: quantity,
      status: z.enum(["show", "hide"]),
      images: z.array(imageValueSchema),
      hasVariants: z.boolean(),
      variants: z.array(variantValueSchema),
    })
    .superRefine((values, ctx) => {
      if (priceAbove(values.price, values.originalPrice)) {
        ctx.addIssue({
          code: "custom",
          path: ["price"],
          message: "Sale price cannot be higher than the original price",
        });
      }

      if (values.images.length > imageLimit) {
        ctx.addIssue({
          code: "custom",
          path: ["images"],
          message: `A product can have up to ${imageLimit} images`,
        });
      }
      const uploads = values.images.filter((image) => image.file).length;
      if (uploads > UPLOAD_IMAGE_LIMIT) {
        ctx.addIssue({
          code: "custom",
          path: ["images"],
          message: `Upload up to ${UPLOAD_IMAGE_LIMIT} new images at a time`,
        });
      }

      if (values.hasVariants && values.variants.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["variants"],
          message: "Generate at least one variant, or turn variants off",
        });
      }

      if (!values.hasVariants) return;
      values.variants.forEach((variant, index) => {
        if (priceAbove(variant.price, variant.originalPrice)) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, "price"],
            message: "Higher than original",
          });
        }
      });
    });

export type ProductValues = z.infer<ReturnType<typeof createProductSchema>>;
export type VariantValue = z.infer<typeof variantValueSchema>;
