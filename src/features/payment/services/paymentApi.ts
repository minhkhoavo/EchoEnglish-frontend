import { createApi } from '@reduxjs/toolkit/query/react';
import { api } from '../../../core/api/api';
import type {
  PaymentResponse,
  PromoCodeValidation,
  ApiResponse,
  UserBalance,
  TransactionHistoryResponse,
  TransactionFilters,
} from '../types';

const paymentApiInjected = api.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation<
      ApiResponse<PaymentResponse>,
      {
        credits: number;
        paymentGateway: string;
        description: string;
        promoCode?: string;
      }
    >({
      query: (body) => ({
        url: '/payments/create',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Payment'],
    }),

    validatePromoCode: builder.mutation<
      PromoCodeValidation,
      { code: string; credits: number }
    >({
      query: ({ code, credits }) => ({
        url: '/promo/validate',
        method: 'POST',
        data: { code, credits },
      }),
    }),

    getUserBalance: builder.query<ApiResponse<UserBalance>, void>({
      query: () => ({ url: '/payments/me/credits', method: 'GET' }),
      providesTags: ['Payment'],
    }),

    getTransactionHistory: builder.query<
      TransactionHistoryResponse,
      TransactionFilters | void
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters?.type) params.append('type', filters.type);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.paymentGateway)
          params.append('paymentGateway', filters.paymentGateway);

        if (filters?.dateFrom) {
          const dateFrom = new Date(filters.dateFrom);
          dateFrom.setHours(0, 0, 0, 0);
          params.append('dateFrom', dateFrom.toISOString());
        }

        if (filters?.dateTo) {
          const dateTo = new Date(filters.dateTo);
          dateTo.setHours(23, 59, 59, 999);
          params.append('dateTo', dateTo.toISOString());
        }

        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const queryString = params.toString();
        return {
          url: `/payments${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Payment'],
    }),
  }),
  overrideExisting: false,
});

export const paymentApi = paymentApiInjected;
export const {
  useCreatePaymentMutation,
  useValidatePromoCodeMutation,
  useGetUserBalanceQuery,
  useGetTransactionHistoryQuery,
} = paymentApi;
