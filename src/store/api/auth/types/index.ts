import type { ID } from "@/types/api";

export enum UserType {
  Customer = "customer",
  Admin = "admin",
  SuperAdmin = "superAdmin",
}

export type UserStatus = "active" | "inactive";

export type SessionUser = {
  _id: ID;
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  userType: UserType;
  status: UserStatus;
  isEmailVerify: boolean;
  isPhoneVerify: boolean;
  role: { _id: ID; name: string } | null;
  permissions: Record<string, Record<string, boolean>>;
};

export type AuthResult = {
  token: string;
  user: SessionUser;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type OtpChallenge = {
  identifier: string;
  channel: "email" | "sms";
  targetMasked: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
  devCode?: string;
};

export type PasswordResetChallenge = OtpChallenge & {
  phoneMasked: string;
};

export type IdentifierPayload = {
  identifier: string;
};

export type VerifyOtpPayload = {
  identifier: string;
  code: string;
};

export type ResetTokenResult = {
  resetToken: string;
  expiresInSeconds: number;
};

export type ResetPasswordPayload = {
  resetToken: string;
  password: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export const isStaff = (userType: UserType): boolean =>
  userType === UserType.Admin || userType === UserType.SuperAdmin;
