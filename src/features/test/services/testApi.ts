import { api } from '@/core/api/api';
import type {
  TOEICTest,
  TOEICTestDetail,
  TOEICTestPartDetail,
  TOEICTestsApiResponse,
  TOEICTestDetailApiResponse,
  TOEICTestPartApiResponse,
} from '../types/test.types';

export const testApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all TOEIC tests
    getTOEICTests: builder.query<TOEICTest[], void>({
      query: () => ({
        url: '/tests/',
        method: 'GET',
      }),
      transformResponse: (response: TOEICTestsApiResponse) => response.data,
      providesTags: ['Test'],
    }),

    // Get full test with all parts
    getTOEICTestById: builder.query<TOEICTestDetail, string>({
      query: (testId) => ({
        url: `/tests/${testId}`,
        method: 'GET',
      }),
      transformResponse: (response: TOEICTestDetailApiResponse) =>
        response.data,
      providesTags: (result, error, id) => [{ type: 'Test' as const, id }],
    }),

    // Get specific part of a test (for individual part loading if needed)
    getTOEICTestByPart: builder.query<
      TOEICTestPartDetail,
      { testId: string; partNumber: number }
    >({
      query: ({ testId, partNumber }) => ({
        url: `/tests/${testId}/part/${partNumber}`,
        method: 'GET',
      }),
      transformResponse: (response: TOEICTestPartApiResponse) => response.data,
      providesTags: (result, error, { testId, partNumber }) => [
        { type: 'Test' as const, id: `${testId}-part${partNumber}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTOEICTestsQuery,
  useGetTOEICTestByIdQuery,
  useGetTOEICTestByPartQuery,
} = testApi;
