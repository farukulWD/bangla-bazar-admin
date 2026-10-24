import { UserType, type SessionUser } from "@/store/api/auth/types";

export const isSuperAdmin = (user: SessionUser | null | undefined): boolean =>
  user?.userType === UserType.SuperAdmin;

export const can = (
  user: SessionUser | null | undefined,
  module: string,
  permission: string,
): boolean => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return user.permissions?.[module]?.[permission] === true;
};
