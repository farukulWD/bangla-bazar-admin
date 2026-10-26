import type { ID, ISODate } from "@/types/api";

export type CouponStatus = "show" | "hide";
export type DiscountType = "percentage" | "fixed";

export type Coupon = {
  _id: ID;
  title: string;
  couponCode: string;
  logo?: string;
  startTime?: ISODate;
  endTime: ISODate;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minimumAmount: number;
  status: CouponStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type CouponPayload = {
  title: string;
  couponCode: string;
  logo?: string;
  startTime?: ISODate;
  endTime: ISODate;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minimumAmount?: number;
  status?: CouponStatus;
};

export type CouponListQuery = {
  searchTerm?: string;
  status?: CouponStatus;
  from?: ISODate;
  to?: ISODate;
  page?: number;
  limit?: number;
  sort?: string;
};

export type CouponBulkUpdatePayload = {
  ids: ID[];
  status?: CouponStatus;
  startTime?: ISODate;
  endTime?: ISODate;
};
