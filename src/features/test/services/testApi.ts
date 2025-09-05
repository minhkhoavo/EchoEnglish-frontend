import { api } from '@/core/api/api';
import type {
  TOEICTest,
  TOEICTestDetail,
  TOEICTestPartDetail,
} from '../types/test.types';

export const testApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTOEICTests: builder.query<TOEICTest[], void>({
      query: () => ({
        url: '/tests/',
        method: 'GET',
      }),
      transformResponse: (response: TOEICTest[]) => response,
    }),

    getTOEICTestById: builder.query<TOEICTestDetail, string>({
      query: (testId) => ({
        url: `/tests/${testId}`,
        method: 'GET',
      }),
    }),

    getTOEICTestByPart: builder.query<
      TOEICTestPartDetail,
      { testId: string; partNumber: number }
    >({
      query: ({ testId, partNumber }) => ({
        url: `/tests/${testId}/part/${partNumber}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetTOEICTestsQuery,
  useGetTOEICTestByIdQuery,
  useGetTOEICTestByPartQuery,
} = testApi;
