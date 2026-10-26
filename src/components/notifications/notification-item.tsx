"use client";

import Link from "next/link";
import { cn } from "cn";

import {
  formatNotificationTime,
  notificationHref,
  NOTIFICATION_ICONS,
} from "@/lib/notifications";
import type { Notification } from "@/store/api/notification/types";

export function NotificationContent({
  notification,
  compact,
}: {
  notification: Notification;
  compact?: boolean;
}) {
  const Icon = NOTIFICATION_ICONS[notification.event];
  const unread = !notification.read;

  return (
    <>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md",
          unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon aria-hidden className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm", unread ? "font-semibold" : "font-medium")}>
          {notification.title}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-sm text-muted-foreground",
            compact && "line-clamp-2 text-xs",
          )}
        >
          {notification.body}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {formatNotificationTime(notification.createdAt)}
        </span>
      </span>

      {unread && (
        <span className="mt-1.5 flex shrink-0 items-center">
          <span aria-hidden className="size-2 rounded-full bg-primary" />
          <span className="sr-only">Unread</span>
        </span>
      )}
    </>
  );
}

export function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const unread = !notification.read;

  return (
    <Link
      href={notificationHref(notification)}
      onClick={() => unread && onRead(notification.id)}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        unread && "bg-primary/5",
      )}
    >
      <NotificationContent notification={notification} />
    </Link>
  );
}
