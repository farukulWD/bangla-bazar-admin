"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BellOff, CheckCheck } from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { TablePagination } from "@/components/layout/table-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-error";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/store/api/notification/api/notificationApi";
import { useUnreadCount } from "@/store/api/notification/hooks/use-unread-count";

import { NotificationItem } from "./notification-item";

const PAGE_SIZE = 20;
const UNREAD = "unread";

const tabClass = (active: boolean) =>
  cn(
    "rounded-full border px-3 py-1 text-sm transition-colors",
    active
      ? "border-primary bg-primary/10 font-medium text-primary"
      : "text-muted-foreground hover:text-foreground",
  );

export function NotificationsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const unreadOnly = searchParams.get("filter") === UNREAD;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const unread = useUnreadCount();

  const { data, isFetching, isLoading, error, refetch } = useGetNotificationsQuery({
    page,
    limit: PAGE_SIZE,
    unreadOnly,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  const notifications = data?.items ?? [];

  const setParams = useCallback(
    (change: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(change)) {
        if (!value) next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setFilter = (nextUnread: boolean) =>
    setParams({ filter: nextUnread ? UNREAD : undefined, page: undefined });

  const setPage = (next: number) =>
    setParams({ page: next > 1 ? String(next) : undefined });

  const onMarkAll = async () => {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read.");
    } catch (markError) {
      toast.error(getErrorMessage(markError, "Could not update notifications."));
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Notifications"
        description="Orders, payments, stock and coupon alerts for your role."
        actions={
          <Button variant="outline" disabled={unread === 0 || markingAll} onClick={onMarkAll}>
            <CheckCheck />
            Mark all as read
          </Button>
        }
      />

      <nav aria-label="Filter notifications" className="mb-4 flex gap-2">
        <button
          type="button"
          aria-pressed={!unreadOnly}
          className={tabClass(!unreadOnly)}
          onClick={() => setFilter(false)}
        >
          All
        </button>
        <button
          type="button"
          aria-pressed={unreadOnly}
          className={tabClass(unreadOnly)}
          onClick={() => setFilter(true)}
        >
          Unread
          {unread > 0 && <span className="ml-1.5 text-xs tabular-nums opacity-80">{unread}</span>}
        </button>
      </nav>

      <Card className="gap-0 overflow-clip py-0">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="px-4 py-3">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-destructive">
            {getErrorMessage(error, "Could not load notifications.")}
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-14 text-center text-sm text-muted-foreground">
            <BellOff className="size-6" />
            {unreadOnly ? "You are all caught up." : "No notifications yet."}
          </div>
        ) : (
          <ul className={cn("divide-y", isFetching && "opacity-60")}>
            {notifications.map((notification) => (
              <li key={notification.id}>
                <NotificationItem
                  notification={notification}
                  onRead={(id) => void markRead(id)}
                />
              </li>
            ))}
          </ul>
        )}

        <TablePagination pagination={data?.pagination} onPageChange={setPage} />
      </Card>
    </div>
  );
}
