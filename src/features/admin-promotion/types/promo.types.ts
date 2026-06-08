// Promotion types for admin management
export interface PromoCode {
  _id?: string;
  code: string;
  discount: number;
  expiration?: string;
  usageLimit?: number;
  usedCount?: number;
  active: boolean;
  maxUsesPerUser?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromoFormData {
  code: string;
  discount: number;
  expiration?: string;
  usageLimit?: number;
  active?: boolean;
  maxUsesPerUser?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
}

export interface PromoFilters {
  search?: string;
  active?: boolean | string;
  minDiscount?: number | string;
  maxDiscount?: number | string;
  sort?: 'asc' | 'desc';
  status?: 'expired' | 'valid' | string;
  availability?: 'out' | 'available' | string;
  limit?: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PromoResponse {
  data: PromoCode[];
  pagination: PaginationInfo;
}
