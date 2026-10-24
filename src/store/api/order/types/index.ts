import type { ID, ISODate } from "@/types/api";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type PaymentMethod = "cod" | "sslcommerz";
export type ShippingKey = "standard" | "express";

export type OrderItemOption = {
  attribute: string;
  value: string;
};

export type OrderItem = {
  product: ID;
  variant: ID | null;
  title: string;
  slug: string;
  image: string;
  sku: string;
  options: OrderItemOption[];
  price: number;
  originalPrice: number;
  qty: number;
  lineTotal: number;
};

export type OrderAddress = {
  name: string;
  contact: string;
  email: string;
  address: string;
  country: string;
  city: string;
  area: string;
  zipCode: string;
};

export type OrderCoupon = {
  coupon: ID;
  code: string;
  title: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
};

export type OrderCurrency = {
  code: string;
  symbol: string;
  symbolPosition: "before" | "after";
  decimals: number;
  thousandSeparator: string;
  decimalSeparator: string;
};

export type OrderActor = {
  _id: ID;
  name: string;
};

export type OrderStatusEntry = {
  status: OrderStatus;
  at: ISODate;
  by: OrderActor | null;
};

export type OrderCustomer = {
  _id: ID;
  name: string;
  email?: string;
  phone?: string;
};

export type Order = {
  _id: ID;
  invoice: number;
  user: OrderCustomer | null;
  items: OrderItem[];
  address: OrderAddress;
  subtotal: number;
  shippingCost: number;
  discount: number;
  coupon: OrderCoupon | null;
  total: number;
  currency: OrderCurrency;
  shippingOption: ShippingKey;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: OrderStatusEntry[];
  paidAt: ISODate | null;
  deliveredAt: ISODate | null;
  cancelledAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type OrderStats = { total: number } & Record<OrderStatus, number>;

export type OrderFilterQuery = {
  searchTerm?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  userId?: ID;
  from?: ISODate;
  to?: ISODate;
};

export type OrderListQuery = OrderFilterQuery & {
  page?: number;
  limit?: number;
  sort?: string;
};
