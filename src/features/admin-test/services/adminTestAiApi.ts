import { api } from '@/core/api/api';

export interface RunAiRequest {
  prompt: string;
  temperature?: number;
}

interface ApiEnvelope<T> {
  message: string;
  data: T;
}

/**
 * Single generic AI endpoint. The prompt is built on the frontend (see
 * adminTestAiPrompts.ts) and the parsed JSON is returned as `unknown`; callers
 * cast it to the result shape they requested.
 */
export const adminTestAiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    runAi: builder.mutation<unknown, RunAiRequest>({
      query: (data) => ({
        url: '/admin/tests/ai',
        method: 'POST',
        data,
      }),
      transformResponse: (response: ApiEnvelope<unknown>) => response.data,
    }),
  }),
});

export const { useRunAiMutation } = adminTestAiApi;
