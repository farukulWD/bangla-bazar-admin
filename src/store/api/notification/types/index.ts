import type { ID, ISODate, Pagination } from "@/types/api";

export type NotificationEvent =
  | "order.placed"
  | "order.status"
  | "order.cancelled"
  | "order.payment"
  | "product.low_stock"
  | "coupon.expiring";

export type NotificationSubject = {
  kind: "order" | "product" | "coupon";
  id: ID;
  code?: string;
};

export type Notification = {
  id: ID;
  event: NotificationEvent;
  audience: "customer" | "staff";
  title: string;
  body: string;
  subject: NotificationSubject;
  link: string;
  read: boolean;
  createdAt: ISODate;
};

export type NotificationListArgs = {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
};

export type NotificationListResult = {
  items: Notification[];
  pagination: Pagination;
};

export type UnreadCount = { count: number };

export type MarkReadResult = { updated: number };
