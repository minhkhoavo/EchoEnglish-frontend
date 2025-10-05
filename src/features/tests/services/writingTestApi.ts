import { api } from '@/core/api/api';
import type {
  WritingTest,
  WritingTestDetail,
  WritingTestsApiResponse,
  WritingTestDetailApiResponse,
} from '../types/writing-test.types';

export const writingTestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tests
    getWritingTests: builder.query<WritingTest[], void>({
      query: () => ({
        url: '/sw-tests/?type=writing',
        method: 'GET',
      }),
      transformResponse: (response: WritingTestsApiResponse) => response.data,
      providesTags: ['WritingTest'],
    }),

    // Get test by ID
    getWritingTestById: builder.query<WritingTestDetail, string>({
      query: (testId) => ({
        url: `/sw-tests/${testId}`,
        method: 'GET',
      }),
      transformResponse: (response: WritingTestDetailApiResponse) =>
        response.data,
      providesTags: (result, error, id) => [
        { type: 'WritingTest' as const, id },
      ],
    }),

    // Get test by part
    getWritingTestByPart: builder.query<
      WritingTestDetail,
      { testId: string; partNumber: number }
    >({
      query: ({ testId, partNumber }) => ({
        url: `/sw-tests/${testId}/part/${partNumber}`,
        method: 'GET',
      }),
      transformResponse: (response: WritingTestDetailApiResponse) =>
        response.data,
      providesTags: (result, error, { testId, partNumber }) => [
        { type: 'WritingTest' as const, id: `${testId}-${partNumber}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWritingTestsQuery,
  useGetWritingTestByIdQuery,
  useGetWritingTestByPartQuery,
} = writingTestApi;
