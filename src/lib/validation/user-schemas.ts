import { z } from "zod";

export const NO_ROLE = "none";

export const createStaffUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required"),
    email: z.union([z.literal(""), z.email("Enter a valid email address")]),
    phone: z.string().trim(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.string(),
  })
  .refine((values) => Boolean(values.email || values.phone), {
    message: "Provide an email address or a phone number",
    path: ["email"],
  });

export type CreateStaffUserValues = z.infer<typeof createStaffUserSchema>;

export const updateStaffUserSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  role: z.string(),
  status: z.enum(["active", "inactive"]),
});

export type UpdateStaffUserValues = z.infer<typeof updateStaffUserSchema>;
