import { z } from "zod";

export const ROOT_PARENT = "root";

export const imageValueSchema = z.object({
  file: z.custom<File | null>((value) => value === null || value instanceof File),
  url: z.string(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/i, "Use letters, numbers and hyphens only"),
  parentId: z.string(),
  description: z.string().trim(),
  icon: imageValueSchema,
  status: z.enum(["show", "hide"]),
});

export type CategoryValues = z.infer<typeof categorySchema>;
export type ImageValue = z.infer<typeof imageValueSchema>;
