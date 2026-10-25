import { formatDistanceToNowStrict, parseISO } from "date-fns";
import {
  Ban,
  CreditCard,
  PackageMinus,
  ShoppingCart,
  TicketPercent,
  Truck,
  type LucideIcon,
} from "lucide-react";

import type {
  Notification,
  NotificationEvent,
  NotificationSubject,
} from "@/store/api/notification/types";

export const NOTIFICATIONS_ROUTE = "/notifications";

const SUBJECT_ROUTES: Record<NotificationSubject["kind"], string> = {
  order: "/orders",
  product: "/products",
  coupon: "/coupons",
};

export const NOTIFICATION_ICONS: Record<NotificationEvent, LucideIcon> = {
  "order.placed": ShoppingCart,
  "order.status": Truck,
  "order.cancelled": Ban,
  "order.payment": CreditCard,
  "product.low_stock": PackageMinus,
  "coupon.expiring": TicketPercent,
};

export const notificationHref = (notification: Notification): string =>
  `${SUBJECT_ROUTES[notification.subject.kind]}/${notification.subject.id}`;

export const formatNotificationTime = (createdAt: string): string =>
  formatDistanceToNowStrict(parseISO(createdAt), { addSuffix: true });

export const formatUnreadBadge = (count: number): string =>
  count > 99 ? "99+" : String(count);
