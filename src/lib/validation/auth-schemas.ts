import { z } from "zod";

const password = z.string().min(6, "Password must be at least 6 characters");

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or phone number"),
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const identifierSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Enter your email address or mobile number"),
});

export const newPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: password,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
});

export const changeEmailSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const changePhoneSchema = z.object({
  phone: z.string().trim().min(1, "Enter your mobile number"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
export type IdentifierValues = z.infer<typeof identifierSchema>;
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;
export type ChangePhoneValues = z.infer<typeof changePhoneSchema>;
