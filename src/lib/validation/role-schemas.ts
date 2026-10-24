import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().trim().min(2, "Role name must be at least 2 characters"),
  description: z.string().trim(),
  isActive: z.boolean(),
  permissions: z.record(z.string(), z.record(z.string(), z.boolean())),
});

export type RoleValues = z.infer<typeof roleSchema>;
