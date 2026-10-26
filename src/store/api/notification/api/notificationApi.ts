import { baseApi } from "@/store/api/baseApi";
import { tagTypes } from "@/store/api/tagTypes";
import type { ApiMeta, ID } from "@/types/api";

import type {
  MarkReadResult,
  Notification,
  NotificationListArgs,
  NotificationListResult,
  UnreadCount,
} from "../types";

export const NOTIFICATION_PAGE_SIZE = 20;

const AUDIENCE = "staff";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<NotificationListResult, NotificationListArgs>({
      query: ({ page = 1, limit = NOTIFICATION_PAGE_SIZE, unreadOnly }) => ({
        url: "/notifications",
        method: "GET",
        params: {
          audience: AUDIENCE,
          page,
          limit,
          sort: "-createdAt",
          ...(unreadOnly ? { read: false } : {}),
        },
      }),

      transformResponse: (
        items: Notification[],
        meta: ApiMeta | undefined,
        arg: NotificationListArgs,
      ): NotificationListResult => ({
        items: items ?? [],
        pagination: meta?.pagination ?? {
          page: arg.page ?? 1,
          limit: arg.limit ?? NOTIFICATION_PAGE_SIZE,
          total: items?.length ?? 0,
          totalPage: 1,
        },
      }),

      providesTags: [{ type: tagTypes.notification, id: "LIST" }],
    }),

    getUnreadCount: build.query<UnreadCount, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
        params: { audience: AUDIENCE },
      }),
      providesTags: [{ type: tagTypes.notification, id: "UNREAD" }],
    }),

    markNotificationRead: build.mutation<MarkReadResult, ID>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: [tagTypes.notification],
    }),

    markAllNotificationsRead: build.mutation<MarkReadResult, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
        params: { audience: AUDIENCE },
      }),
      invalidatesTags: [tagTypes.notification],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
