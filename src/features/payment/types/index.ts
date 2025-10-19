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
export const TransactionType = {
  PURCHASE: 'purchase',
  DEDUCTION: 'deduction',
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export interface Transaction {
  _id: string;
  user: string;
  type: TransactionType;
  tokens: number;
  description: string;
  amount: number;
  discount: number;
  status: PaymentStatus;
  paymentGateway: PaymentMethod;
  expiredAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  payUrl?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: PaymentStatus;
  paymentGateway?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface TransactionHistoryResponse {
  message: string;
  data: {
    transaction: Transaction[];
  };
}

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

// Promo Code Interface
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

// Promo Code Validation Response
export interface PromoCodeValidation {
  message: string;
  data?: {
    code: string;
    discount: number;
  };
}

// Credit Calculation Interface
export interface CreditCalculation {
  credits: number;
  baseAmountVnd: number;
  discountVnd: number;
  finalAmountVnd: number;
  promoCode?: string;
}
