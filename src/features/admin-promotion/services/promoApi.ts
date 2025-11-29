import { api } from '@/core/api/api';
import type {
  PromoCode,
  PromoFormData,
  PromoFilters,
  PromoResponse,
} from '../types/promo.types';

interface GetPromosParams extends PromoFilters {
  page?: number;
  limit?: number;
}

export const adminPromoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPromos: builder.query<
      { message: string; data: PromoResponse },
      GetPromosParams
    >({
      query: (params) => {
        // Remove empty filter values
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== '' && v !== undefined && v !== null
          )
        );
        return {
          url: '/promo',
          method: 'GET',
          params: cleanParams,
        };
      },
    }),
    getPromoById: builder.query<{ message: string; data: PromoCode }, string>({
      query: (id) => ({
        url: `/promo/${id}`,
        method: 'GET',
      }),
    }),
    createPromo: builder.mutation<
      { message: string; data: PromoCode },
      PromoFormData
    >({
      query: (data) => ({
        url: '/promo',
        method: 'POST',
        data,
      }),
    }),
    updatePromo: builder.mutation<
      { message: string; data: PromoCode },
      { id: string; data: Partial<PromoFormData> }
    >({
      query: ({ id, data }) => ({
        url: `/promo/${id}`,
        method: 'PUT',
        data,
      }),
    }),
    deletePromo: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/promo/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetPromosQuery,
  useGetPromoByIdQuery,
  useCreatePromoMutation,
  useUpdatePromoMutation,
  useDeletePromoMutation,
} = adminPromoApi;
