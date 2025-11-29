import { api } from '@/core/api/api';

export interface User {
  _id: string;
  email: string;
  fullName: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SendNotificationRequest {
  title: string;
  body?: string;
  deepLink?: string;
  type: string;
  userIds: string[];
}

export const adminNotificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendNotification: builder.mutation<
      { message: string },
      SendNotificationRequest
    >({
      query: (data) => ({
        url: '/notifications/send',
        method: 'POST',
        data,
      }),
    }),
    getUserList: builder.query<
      { message: string; data: UserListResponse },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 9999 }) => ({
        url: '/users',
        method: 'GET',
        params: { page, limit },
      }),
    }),
  }),
});

export const { useSendNotificationMutation, useGetUserListQuery } =
  adminNotificationApi;
