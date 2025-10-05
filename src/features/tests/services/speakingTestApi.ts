import { api } from '@/core/api/api';
import type { SpeakingWritingTest } from '../types/shared.types';
import type {
  SpeakingTest,
  SpeakingTestDetail,
  SpeakingTestsApiResponse,
  SpeakingTestDetailApiResponse,
} from '../types/speaking-test.types';

export const speakingTestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tests
    getSpeakingTests: builder.query<SpeakingTest[], void>({
      query: () => ({
        url: '/sw-tests?type=speaking',
        method: 'GET',
      }),
      transformResponse: (response: SpeakingTestsApiResponse) => response.data,
      providesTags: ['SpeakingTest'],
    }),

    // Get test by ID
    getSpeakingTestById: builder.query<SpeakingTestDetail, string>({
      query: (testId) => ({
        url: `/sw-tests/${testId}`,
        method: 'GET',
      }),
      transformResponse: (response: SpeakingTestDetailApiResponse) =>
        response.data,
      providesTags: (result, error, id) => [
        { type: 'SpeakingTest' as const, id },
      ],
    }),

    // Get test by part
    getSpeakingTestByPart: builder.query<
      SpeakingTestDetail,
      { testId: string; partNumber: number }
    >({
      query: ({ testId, partNumber }) => ({
        url: `/sw-tests/${testId}/part/${partNumber}`,
        method: 'GET',
      }),
      transformResponse: (response: SpeakingTestDetailApiResponse) =>
        response.data,
      providesTags: (result, error, { testId, partNumber }) => [
        { type: 'SpeakingTest' as const, id: `${testId}-${partNumber}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSpeakingTestsQuery,
  useGetSpeakingTestByIdQuery,
  useGetSpeakingTestByPartQuery,
} = speakingTestApi;
