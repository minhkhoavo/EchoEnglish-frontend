import { createApi } from '@reduxjs/toolkit/query/react';
import { api } from '../../../core/api/api';
import type {
  PaymentResponse,
  PromoCodeValidation,
  ApiResponse,
  UserBalance,
} from '../types';

const paymentApiInjected = api.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation<
      ApiResponse<PaymentResponse>,
      { credits: number; paymentGateway: string; description: string }
    >({
      query: (body) => ({
        url: '/payments/create',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Payment'],
    }),

    validatePromoCode: builder.mutation<
      ApiResponse<PromoCodeValidation>,
      { code: string; credits: number }
    >({
      query: ({ code, credits }) => ({
        url: '/promo-codes/validate',
        method: 'POST',
        data: { code, credits },
      }),
    }),

    getUserBalance: builder.query<ApiResponse<UserBalance>, void>({
      query: () => ({ url: '/payments/me/credits', method: 'GET' }),
    }),
  }),
  overrideExisting: false,
});

export const paymentApi = paymentApiInjected;
export const {
  useCreatePaymentMutation,
  useValidatePromoCodeMutation,
  useGetUserBalanceQuery,
} = paymentApi;
