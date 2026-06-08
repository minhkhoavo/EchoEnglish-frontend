import { api } from '@/core/api/api';
import type { PracticeDrillData } from '../types/practice-drill.types';

export interface FetchQuestionsByIdsRequest {
  questionIds: string[];
}

export interface FetchQuestionsByIdsResponse {
  message: string;
  data: PracticeDrillData;
}

export const practiceDrillApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchQuestionsByIds: builder.query<PracticeDrillData, string[]>({
      query: (questionIds) => ({
        url: '/tests/questions/by-ids',
        method: 'POST',
        data: { questionIds },
      }),
      transformResponse: (response: FetchQuestionsByIdsResponse) =>
        response.data,
    }),
  }),
  overrideExisting: false,
});

export const { useFetchQuestionsByIdsQuery, useLazyFetchQuestionsByIdsQuery } =
  practiceDrillApi;
