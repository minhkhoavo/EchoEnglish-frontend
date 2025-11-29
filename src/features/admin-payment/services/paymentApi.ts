import axios from '@/core/api/axios';
import type {
  Payment,
  PaymentFilters,
  PaymentResponse,
} from '../types/payment.types';

export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Get all payments with filters and pagination (for admin)
export const getPayments = async (
  page: number = 1,
  limit: number = 10,
  filters?: PaymentFilters
): Promise<ApiResponse<PaymentResponse>> => {
  const params: Record<string, unknown> = { page, limit, ...filters };

  // Remove empty filter values
  Object.keys(params).forEach(
    (k) =>
      (params[k] === '' || params[k] === undefined || params[k] === null) &&
      delete params[k]
  );

  const response = await axios.get('/payments/admin/all', { params });
  return response.data;
};

// Get payment by ID
export const getPaymentById = async (
  id: string
): Promise<ApiResponse<Payment>> => {
  const response = await axios.get(`/payments/${id}`);
  return response.data;
};

// Export payment stats helper
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
