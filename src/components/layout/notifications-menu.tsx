"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { NotificationContent } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationSocket } from "@/hooks/use-notification-socket";
import { getErrorMessage } from "@/lib/api-error";
import {
  formatUnreadBadge,
  notificationHref,
  NOTIFICATIONS_ROUTE,
} from "@/lib/notifications";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/store/api/notification/api/notificationApi";
import { useUnreadCount } from "@/store/api/notification/hooks/use-unread-count";

const MENU_LIMIT = 8;

export function NotificationsMenu() {
  useNotificationSocket();

  const [open, setOpen] = useState(false);
  const unread = useUnreadCount();

  const { data, isLoading, error } = useGetNotificationsQuery(
    { limit: MENU_LIMIT },
    { skip: !open },
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  const notifications = data?.items ?? [];

  const onMarkAll = async () => {
    try {
      await markAllRead().unwrap();
    } catch (markError) {
      toast.error(getErrorMessage(markError, "Could not update notifications."));
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
            className="relative"
          />
        }
      >
        <Bell />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-primary-foreground tabular-nums">
            {formatUnreadBadge(unread)}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuGroup className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="text-sm text-foreground">Notifications</DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            disabled={unread === 0 || markingAll}
            onClick={onMarkAll}
          >
            <CheckCheck />
            Mark all read
          </Button>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-0" />

        <div className="max-h-96 overflow-y-auto p-1">
          {isLoading ? (
            Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="m-1 h-14" />
            ))
          ) : error ? (
            <p className="px-3 py-8 text-center text-sm text-destructive">
              {getErrorMessage(error, "Could not load notifications.")}
            </p>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-8 text-center text-sm text-muted-foreground">
              <BellOff className="size-6" />
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                render={<Link href={notificationHref(notification)} />}
                onClick={() => !notification.read && void markRead(notification.id)}
                className="items-start gap-3 px-2 py-2"
              >
                <NotificationContent notification={notification} compact />
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="my-0" />
        <DropdownMenuItem
          render={<Link href={NOTIFICATIONS_ROUTE} />}
          className="m-1 justify-center font-medium"
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
