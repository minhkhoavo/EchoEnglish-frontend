import axios from '@/core/api/axios';
import type {
  PromoCode,
  PromoFormData,
  PromoFilters,
  PromoResponse,
} from '../types/promo.types';

export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Get all promo codes with filters and pagination
export const getPromos = async (
  page: number = 1,
  limit: number = 10,
  filters?: PromoFilters
): Promise<ApiResponse<PromoResponse>> => {
  const params: Record<string, unknown> = { page, limit, ...filters };

  // Remove empty filter values
  Object.keys(params).forEach((k) => {
    if (params[k] === '' || params[k] === undefined || params[k] === null) {
      delete params[k];
    }
  });

  const response = await axios.get('/promo', { params });
  return response.data;
};

// Get promo code by ID
export const getPromoById = async (
  id: string
): Promise<ApiResponse<PromoCode>> => {
  const response = await axios.get(`/promo/${id}`);
  return response.data;
};

// Create new promo code
export const createPromo = async (
  data: PromoFormData
): Promise<ApiResponse<PromoCode>> => {
  const response = await axios.post('/promo', data);
  return response.data;
};

// Update promo code
export const updatePromo = async (
  id: string,
  data: Partial<PromoFormData>
): Promise<ApiResponse<PromoCode>> => {
  const response = await axios.put(`/promo/${id}`, data);
  return response.data;
};

// Delete promo code
export const deletePromo = async (id: string): Promise<ApiResponse<null>> => {
  const response = await axios.delete(`/promo/${id}`);
  return response.data;
};
