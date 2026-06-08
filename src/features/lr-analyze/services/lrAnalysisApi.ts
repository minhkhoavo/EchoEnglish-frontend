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
    getAnalysisResult: builder.query<ExamAnalysisResult, string>({
      query: (testResultId) => ({
        url: `/test-results/${testResultId}/analysis`,
        method: 'GET',
      }),
      transformResponse: (response: AnalysisApiResponse) => {
        const result = response.data;

        if (result.analysis?.examAnalysis) {
          result.overallSkills = result.analysis.examAnalysis.overallSkills;
          result.partAnalyses = result.analysis.examAnalysis.partAnalyses;
          result.topWeaknesses = result.analysis.examAnalysis.topWeaknesses;
          result.weaknesses = result.analysis.examAnalysis.topWeaknesses;
          result.strengths = result.analysis.examAnalysis.strengths;
          result.keyInsights = result.analysis.examAnalysis.keyInsights;
          result.domainPerformance =
            result.analysis.examAnalysis.domainPerformance;
          result.summary = result.analysis.examAnalysis.summary;
        }

        if (result.analysis?.timeAnalysis) {
          result.timeAnalysis = result.analysis.timeAnalysis;
        }

        return result;
      },
      providesTags: (result, error, testResultId) => [
        { type: 'TestResult', id: testResultId },
      ],
    }),

    requestAnalysis: builder.mutation<
      { success: boolean; data: ExamAnalysisResult; creditsUsed: number },
      string
    >({
      query: (testResultId) => ({
        url: `/test-results/${testResultId}/analyze`,
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useGetAnalysisResultQuery,
  useLazyGetAnalysisResultQuery,
  useRequestAnalysisMutation,
} = lrAnalysisApi;
