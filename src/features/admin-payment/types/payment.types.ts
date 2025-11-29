// Payment types for admin management
export const PaymentStatus = {
  INITIATED: 'INITIATED',
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  CANCELED: 'CANCELED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const TransactionType = {
  PURCHASE: 'purchase',
  DEDUCTION: 'deduction',
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export const PaymentGateway = {
  VNPAY: 'VNPAY',
  STRIPE: 'STRIPE',
} as const;

export type PaymentGateway =
  (typeof PaymentGateway)[keyof typeof PaymentGateway];

export interface PopulatedUser {
  _id: string;
  fullName: string;
  email: string;
}

export interface Payment {
  _id: string;
  user: string | PopulatedUser;
  type: TransactionType;
  tokens: number;
  description?: string;
  amount: number;
  discount: number;
  promoCode?: string;
  status: PaymentStatus;
  paymentGateway: PaymentGateway;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus | string;
  type?: TransactionType | string;
  gateway?: PaymentGateway | string;
  email?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  sort?: 'asc' | 'desc';
}

export interface PaymentStats {
  totalAmount: number;
  totalTransactions: number;
  succeeded: number;
  failed: number;
  purchased: number;
  used: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaymentResponse {
  data: Payment[];
  pagination: PaginationInfo;
}
