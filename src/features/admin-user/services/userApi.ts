import { api } from '@/core/api/api';
import type { User, UserFilters, UserResponse } from '../types/user.types';

export const adminUserApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<{ data: UserResponse }, UserFilters>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
        return {
          url: '/users',
          method: 'GET',
          params: Object.fromEntries(queryParams),
        };
      },
      providesTags: ['User'],
    }),

    getUserById: builder.query<{ data: User }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation<
      { message: string; data: User },
      {
        fullName: string;
        email: string;
        password: string;
        phoneNumber?: string;
        address?: string;
        gender?: string;
        roles?: string[];
      }
    >({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation<
      { message: string; data: User },
      { id: string; data: Partial<User> }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        'User',
      ],
    }),

    deleteUser: builder.mutation<
      { message: string },
      { id: string; hard?: boolean }
    >({
      query: ({ id, hard = false }) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        'User',
      ],
    }),

    restoreUser: builder.mutation<{ message: string; data: User }, string>({
      query: (id) => ({
        url: `/users/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'User', id }, 'User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
} = adminUserApi;

export const calculateUserStats = (users: User[]) => {
  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => !u.isDeleted).length,
    deletedUsers: users.filter((u) => u.isDeleted).length,
    totalCredits: users.reduce((sum, u) => sum + (u.credits || 0), 0),
  };
};
