import { formatDistanceToNowStrict, parseISO } from "date-fns";
import {
  Ban,
  CreditCard,
  PackageMinus,
  ShoppingCart,
  Star,
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
  review: "/reviews",
};

export const NOTIFICATION_ICONS: Record<NotificationEvent, LucideIcon> = {
  "order.placed": ShoppingCart,
  "order.status": Truck,
  "order.cancelled": Ban,
  "order.payment": CreditCard,
  "product.low_stock": PackageMinus,
  "coupon.expiring": TicketPercent,
  "review.submitted": Star,
};

export const notificationHref = ({ subject }: Notification): string =>
  subject.kind === "review"
    ? `${SUBJECT_ROUTES.review}?id=${subject.id}`
    : `${SUBJECT_ROUTES[subject.kind]}/${subject.id}`;

export const formatNotificationTime = (createdAt: string): string =>
  formatDistanceToNowStrict(parseISO(createdAt), { addSuffix: true });

export const formatUnreadBadge = (count: number): string =>
  count > 99 ? "99+" : String(count);
