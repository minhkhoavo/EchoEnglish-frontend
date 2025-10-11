import { api } from '@/core/api/api';
import type {
  WritingOverallResult,
  WritingResultStats,
  BackendWritingResult,
} from '../types/writing-result.types';

export interface GetWritingResultByIdParams {
  id: string;
}

export interface WritingResultApiResponse {
  message: string;
  data: BackendWritingResult;
}

export const writingResultApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWritingResultById: builder.query<
      WritingResultApiResponse,
      GetWritingResultByIdParams
    >({
      query: ({ id }) => ({
        url: `/writing-results/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'WritingTest', id }],
    }),

    getAllWritingResults: builder.query<WritingResultApiResponse[], void>({
      query: () => ({
        url: '/writing-results',
        method: 'GET',
      }),
      providesTags: ['WritingTest'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetWritingResultByIdQuery, useGetAllWritingResultsQuery } =
  writingResultApi;
