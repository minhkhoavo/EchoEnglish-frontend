import { api } from '@/core/api/api';
import type {
  UserStatsResponse,
  TestStatsResponse,
  PaymentStatsResponse,
  ResourceStatsResponse,
  DashboardDateRange,
} from '../types/dashboard.types';

const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserGrowthStats: builder.query<UserStatsResponse, DashboardDateRange>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.from) searchParams.append('from', params.from);
        if (params.to) searchParams.append('to', params.to);
        if (params.by) searchParams.append('by', params.by);

        return {
          url: `/dashboard/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['User'],
    }),

    getTestStats: builder.query<TestStatsResponse, DashboardDateRange>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.from) searchParams.append('from', params.from);
        if (params.to) searchParams.append('to', params.to);
        if (params.by) searchParams.append('by', params.by);

        return {
          url: `/dashboard/tests${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Test'],
    }),

    getPaymentStats: builder.query<PaymentStatsResponse, DashboardDateRange>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.from) searchParams.append('from', params.from);
        if (params.to) searchParams.append('to', params.to);
        if (params.by) searchParams.append('by', params.by);

        return {
          url: `/dashboard/payments${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Payment'],
    }),

    getResourceStats: builder.query<ResourceStatsResponse, void>({
      query: () => ({
        url: '/dashboard/resources',
        method: 'GET',
      }),
      providesTags: ['Category'],
    }),
  }),
});

export const {
  useGetUserGrowthStatsQuery,
  useGetTestStatsQuery,
  useGetPaymentStatsQuery,
  useGetResourceStatsQuery,
} = dashboardApi;
