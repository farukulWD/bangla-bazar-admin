import { z } from "zod";

export const ATTRIBUTE_OPTIONS = [
  { label: "Dropdown", value: "dropdown" },
  { label: "Radio", value: "radio" },
  { label: "Checkbox", value: "checkbox" },
] as const;

export const ATTRIBUTE_TYPES = [
  { label: "Attribute", value: "attribute" },
  { label: "Extra", value: "extra" },
] as const;

export const attributeSchema = z
  .object({
    name: z.string().trim().min(1, "Attribute name is required"),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]*$/i, "Use letters, numbers and hyphens only"),
    option: z.enum(["dropdown", "radio", "checkbox"]),
    type: z.enum(["attribute", "extra"]),
    status: z.enum(["show", "hide"]),
    values: z.array(z.object({ name: z.string().trim() })),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.values.forEach((value, index) => {
      const key = value.name.toLowerCase();
      if (!key) return;
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["values", index, "name"],
          message: "Duplicate value",
        });
      }
      seen.add(key);
    });
  });

export type AttributeValues = z.infer<typeof attributeSchema>;

export const attributeValueSchema = z.object({
  name: z.string().trim().min(1, "Value name is required"),
});

export type AttributeValueValues = z.infer<typeof attributeValueSchema>;
