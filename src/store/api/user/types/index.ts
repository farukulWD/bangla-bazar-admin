import type { UserStatus, UserType } from "@/store/api/auth/types";
import type { OrderStatus } from "@/store/api/order/types";
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

export type CustomerOrderStats = {
  orderCount: number;
  totalSpent: number;
  lastOrderAt: ISODate | null;
};

export type Customer = StaffUser &
  CustomerOrderStats & {
    address?: string;
    city?: string;
    country?: string;
    isPhoneVerify?: boolean;
    isEmailVerify?: boolean;
  };

export type CustomerAddress = {
  _id: ID;
  name: string;
  contact: string;
  email: string;
  address: string;
  country: string;
  city: string;
  area: string;
  zipCode: string;
  isDefault: boolean;
};

export type CustomerSummary = {
  user: Customer;
  stats: CustomerOrderStats & { byStatus: Record<OrderStatus, number> };
  addresses: CustomerAddress[];
};

export type CustomerFilterQuery = {
  searchTerm?: string;
  isActive?: boolean;
  from?: string;
  to?: string;
};

export type CustomerListQuery = CustomerFilterQuery & {
  page?: number;
  limit?: number;
  sort?: string;
};
