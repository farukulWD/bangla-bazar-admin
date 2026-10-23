import type { UserStatus, UserType } from "@/store/api/auth/types";
import type { ID, ISODate } from "@/types/api";

export type StaffUser = {
  _id: ID;
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  userType: UserType;
  status: UserStatus;
  role: { _id: ID; name: string; description?: string; isActive: boolean } | null;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type UserListQuery = {
  searchTerm?: string;
  userType?: string;
  isActive?: boolean;
  role?: ID;
  sort?: string;
  page?: number;
  limit?: number;
};

export type CreateStaffUserPayload = {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role?: ID | null;
};

export type UpdateStaffUserPayload = {
  name?: string;
  role?: ID | null;
  status?: UserStatus;
};
