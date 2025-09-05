import { api } from '@/core/api/api';

export interface TOEICTest {
  testId: string;
  testTitle: string;
}

export interface TOEICTestsResponse {
  tests: TOEICTest[];
  total?: number;
  page?: number;
  limit?: number;
}

export const testApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTOEICTests: builder.query<TOEICTest[], void>({
      query: () => ({
        url: '/tests/',
        method: 'GET',
      }),
      transformResponse: (response: TOEICTest[]) => response,
    }),
  }),
});

export const { useGetTOEICTestsQuery } = testApi;
