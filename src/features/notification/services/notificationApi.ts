import { api } from '@/core/api/api';
import type {
  Notification,
  NotificationFormData,
} from '../types/notification.type';
import { NotificationType } from '../types/notification-types';
import { mapType } from '../types/notification-types';

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface User {
  _id: string;
  fullName: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get user list for admin selection
    getUserList: builder.query<
      ApiResponse<UserListResponse>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 9999 } = {}) => ({
        url: '/users',
        method: 'GET' as const,
        params: { page, limit, fields: '_id,fullName' },
      }),
      providesTags: ['User'],
    }),

    // Get unread notification count
    getUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => ({
        url: '/notifications/unread-count',
        method: 'GET' as const,
      }),
      transformResponse: (response: ApiResponse<number>) => {
        return {
          ...response,
          data: { count: response.data },
        };
      },
      providesTags: ['Notification'],
    }),

    // Get user notifications with pagination
    getUserNotifications: builder.query<
      ApiResponse<NotificationResponse>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 9999 } = {}) => ({
        url: '/notifications',
        method: 'GET' as const,
        params: { page, limit },
      }),
      providesTags: ['Notification'],
      transformResponse: (
        response: ApiResponse<{
          notifications: Array<{
            _id: string;
            title: string;
            body?: string;
            deepLink?: string;
            type: string;
            createdAt: string;
            updatedAt?: string;
            isRead: boolean;
          }>;
          pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            hasNext: boolean;
            hasPrev: boolean;
          };
        }>
      ) => {
        return {
          ...response,
          data: {
            ...response.data,
            notifications: response.data.notifications.map((n) => ({
              id: n._id,
              title: n.title,
              body: n.body,
              deepLink: n.deepLink,
              type: mapType(n.type),
              createdAt: n.createdAt,
              updatedAt: n.updatedAt,
              isRead: n.isRead,
            })),
          },
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        const isFirstPage = arg.page === 1 || !arg.page;
        if (isFirstPage) {
          return newItems;
        }
        // Merge for pagination
        return {
          ...newItems,
          data: {
            ...newItems.data,
            notifications: [
              ...currentCache.data.notifications,
              ...newItems.data.notifications,
            ],
          },
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),

    // Send notification (admin only)
    sendNotification: builder.mutation<
      ApiResponse<Notification>,
      NotificationFormData
    >({
      query: (data) => ({
        url: '/notifications',
        method: 'POST' as const,
        data: {
          ...data,
        },
      }),
      invalidatesTags: ['Notification'],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<ApiResponse<void>, string>({
      query: (notificationId) => ({
        url: `/notifications/read/${notificationId}`,
        method: 'PUT' as const,
      }),
      async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
        // Optimistic update for notifications list
        const patchResult = dispatch(
          notificationApi.util.updateQueryData(
            'getUserNotifications',
            {},
            (draft) => {
              const notification = draft.data.notifications.find(
                (n) => n.id === notificationId
              );
              if (notification) {
                notification.isRead = true;
              }
            }
          )
        );

        // Optimistic update for unread count
        const patchUnreadCount = dispatch(
          notificationApi.util.updateQueryData(
            'getUnreadCount',
            undefined,
            (draft) => {
              if (draft.data.count > 0) {
                draft.data.count -= 1;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          patchUnreadCount.undo();
        }
      },
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/notifications/read/all',
        method: 'PUT' as const,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        // Optimistic update for notifications list
        const patchResult = dispatch(
          notificationApi.util.updateQueryData(
            'getUserNotifications',
            {},
            (draft) => {
              draft.data.notifications.forEach((notification) => {
                notification.isRead = true;
              });
            }
          )
        );

        // Optimistic update for unread count
        const patchUnreadCount = dispatch(
          notificationApi.util.updateQueryData(
            'getUnreadCount',
            undefined,
            (draft) => {
              draft.data.count = 0;
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          patchUnreadCount.undo();
        }
      },
    }),

    // Soft delete notification
    deleteNotification: builder.mutation<ApiResponse<void>, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE' as const,
      }),
      async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
        // Optimistic update - remove from notifications list
        const patchResult = dispatch(
          notificationApi.util.updateQueryData(
            'getUserNotifications',
            {},
            (draft) => {
              draft.data.notifications = draft.data.notifications.filter(
                (notification) => notification.id !== notificationId
              );
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetUserListQuery,
  useGetUnreadCountQuery,
  useGetUserNotificationsQuery,
  useSendNotificationMutation,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
