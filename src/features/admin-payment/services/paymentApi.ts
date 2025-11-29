import { api } from '@/core/api/api';
import type {
  Payment,
  PaymentFilters,
  PaymentResponse,
} from '../types/payment.types';

interface GetPaymentsParams extends PaymentFilters {
  page?: number;
  limit?: number;
}

export const adminPaymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<
      { message: string; data: PaymentResponse },
      GetPaymentsParams
    >({
      query: (params) => {
        // Remove empty filter values
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== '' && v !== undefined && v !== null
          )
        );
        return {
          url: '/payments/admin/all',
          method: 'GET',
          params: cleanParams,
        };
      },
    }),
    getPaymentById: builder.query<{ message: string; data: Payment }, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetPaymentsQuery, useGetPaymentByIdQuery } = adminPaymentApi;

// Payment stats helper
export const calculatePaymentStats = (payments: Payment[] = []) => {
  return {
    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    totalTransactions: payments.length,
    succeeded: payments.filter((p) => p.status === 'SUCCEEDED').length,
    failed: payments.filter((p) => p.status === 'FAILED').length,
    purchased: payments
      .filter((p) => p.type === 'purchase')
      .reduce((sum, p) => sum + (p.tokens || 0), 0),
    used: payments
      .filter((p) => p.type === 'deduction')
      .reduce((sum, p) => sum + (p.tokens || 0), 0),
  };
};
