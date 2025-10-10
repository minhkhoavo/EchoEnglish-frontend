import { api } from '@/core/api/api';
import type {
  AnalysisApiResponse,
  ExamAnalysisResult,
} from '../types/analysis';

/**
 * LR Analysis API endpoints
 * Handles fetching and managing Listening & Reading analysis results
 */
export const lrAnalysisApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get analysis result for a specific test result
     * @param testResultId - The ID of the test result to analyze
     * @returns Test result with embedded analysis data
     */
    getAnalysisResult: builder.query<ExamAnalysisResult, string>({
      query: (testResultId) => ({
        url: `/test-results/${testResultId}/analysis`,
        method: 'GET',
      }),
      transformResponse: (response: AnalysisApiResponse) => {
        // Extract data from the response wrapper
        return response.data;
      },
      providesTags: (result, error, testResultId) => [
        { type: 'TestResult', id: testResultId },
      ],
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const { useGetAnalysisResultQuery, useLazyGetAnalysisResultQuery } =
  lrAnalysisApi;
