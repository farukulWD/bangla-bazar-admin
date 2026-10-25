"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { notificationHref } from "@/lib/notifications";
import { getSocket, NOTIFICATION_EVENT } from "@/lib/socket";
import { useSession } from "@/store/api/auth/hooks/use-session";
import { refreshAccessToken } from "@/store/api/baseQueryWithReauth";
import { notificationApi } from "@/store/api/notification/api/notificationApi";
import type { Notification } from "@/store/api/notification/types";
import { tagTypes } from "@/store/api/tagTypes";
import { getAuthToken, subscribeToAuthToken } from "@/store/api/token";
import { useAppDispatch } from "@/store/hooks";

export const useNotificationSocket = (): void => {
  const { isStaff } = useSession();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!isStaff) return;

    const socket = getSocket();
    let refreshTried = false;
    let connectedBefore = false;

    const refreshInbox = () =>
      dispatch(notificationApi.util.invalidateTags([tagTypes.notification]));

    const onConnect = () => {
      refreshTried = false;
      if (connectedBefore) refreshInbox();
      connectedBefore = true;
    };

    const onConnectError = () => {
      if (socket.active || refreshTried) return;
      refreshTried = true;
      void refreshAccessToken();
    };

    const onNotification = (notification: Notification) => {
      if (notification.audience !== "staff") return;

      refreshInbox();
      toast(notification.title, {
        description: notification.body,
        action: {
          label: "View",
          onClick: () => router.push(notificationHref(notification)),
        },
      });
    };

    const syncWithToken = () => {
      if (!getAuthToken()) socket.disconnect();
      else if (!socket.connected) socket.connect();
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on(NOTIFICATION_EVENT, onNotification);
    const unsubscribe = subscribeToAuthToken(syncWithToken);
    syncWithToken();

    return () => {
      unsubscribe();
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off(NOTIFICATION_EVENT, onNotification);
      socket.disconnect();
    };
  }, [isStaff, dispatch, router]);
};
