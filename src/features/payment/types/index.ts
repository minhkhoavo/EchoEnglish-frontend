export const PaymentStatus = {
  INITIATED: 'INITIATED',
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  CANCELED: 'CANCELED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  STRIPE: 'STRIPE',
  VNPAY: 'VNPAY',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface UserBalance {
  userId: string;
  credits: number;
  lastUpdated: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  credits: number;
  amountVnd: number;
  discountVnd: number;
  finalAmountVnd: number;
  paymentMethod: PaymentMethod;
  payUrl?: string;
  expiryTime: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const TransactionType = {
  PURCHASE: 'PURCHASE',
  USAGE: 'USAGE',
  REFUND: 'REFUND',
  BONUS: 'BONUS',
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  credits: number;
  amountVnd?: number;
  description: string;
  paymentId?: string;
  paymentMethod?: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionFilter {
  type?: TransactionType;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PromoCodeValidation {
  isValid: boolean;
  discountVnd: number;
  message?: string;
  promoCode?: {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minAmount: number;
    maxDiscount?: number;
    expiryDate: string;
    isActive: boolean;
    usageLimit?: number;
    usedCount: number;
  };
}

export interface CreditCalculation {
  credits: number;
  baseAmountVnd: number;
  discountVnd: number;
  finalAmountVnd: number;
  promoCode?: string;
}
