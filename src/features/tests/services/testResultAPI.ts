import { api } from '@/core/api/api';

export interface SubmitTestResultRequest {
  testId: string;
  testTitle: string;
  testType: string;
  duration: number; // in milliseconds
  startedAt?: number;
  userAnswers: Array<{
    questionNumber: number;
    selectedAnswer: string;
    answerTimeline?: Array<{
      answer: string;
      timestamp: number; // milliseconds from test start
      duration?: number;
    }>;
  }>;
  parts: string[];
}

export interface TestResultSummary {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  message: string;
}

export interface TestHistoryItem {
  id: string;
  testTitle: string;
  testType: string;
  completedAt: string;
  score: number;
  totalQuestions: number;
  duration: number;
  percentage: number;
  partsKey: string;
}

export interface TestResultDetail {
  id: string;
  testId: string;
  testTitle: string;
  testType: string;
  duration: number;
  completedAt: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  userAnswers: Array<{
    questionNumber: number;
    selectedAnswer: string;
    isCorrect: boolean;
    correctAnswer: string;
  }>;
  parts: string[];
}

export interface UserStats {
  listeningReadingTests: number;
  averageScore: number;
  highestScore: number;
  recentTests: TestHistoryItem[];
}

interface TestHistoryApiResponse {
  data: TestHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const testResultApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Submit test result
    submitTestResult: builder.mutation<
      TestResultSummary,
      SubmitTestResultRequest
    >({
      query: (data) => ({
        url: '/test-results/submit',
        method: 'POST',
        data: data,
      }),
      transformResponse: (response: { data: TestResultSummary }) =>
        response.data,
      invalidatesTags: ['TestResult'],
    }),

    // Get test history
    getTestHistory: builder.query<
      TestHistoryApiResponse,
      { page?: number; limit?: number; userId?: string; testId?: string }
    >({
      query: ({ page = 1, limit = 10, userId, testId } = {}) => {
        let url = `/test-results/history?page=${page}&limit=${limit}`;
        if (userId) url += `&userId=${userId}`;
        if (testId) url += `&testId=${testId}`;
        return {
          url,
          method: 'GET',
        };
      },
      transformResponse: (
        response: {
          data: {
            results: TestHistoryItem[];
            total: number;
          };
        },
        _meta,
        arg
      ) => {
        const { page = 1, limit = 10 } = arg;
        const totalPages = Math.ceil(response.data.total / limit);
        return {
          data: response.data.results,
          pagination: {
            page,
            limit,
            total: response.data.total,
            totalPages,
          },
        };
      },
      providesTags: ['TestResult'],
    }),

    // Get test result detail
    getTestResultDetail: builder.query<TestResultDetail, string>({
      query: (resultId) => ({
        url: `/test-results/detail/${resultId}`,
        method: 'GET',
      }),
      transformResponse: (response: { data: TestResultDetail }) =>
        response.data,
      providesTags: (result, error, id) => [
        { type: 'TestResult' as const, id },
      ],
    }),

    // Get user stats
    getUserStats: builder.query<UserStats, void>({
      query: () => ({
        url: '/test-results/stats',
        method: 'GET',
      }),
      transformResponse: (response: { data: UserStats }) => response.data,
      providesTags: ['TestResult'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSubmitTestResultMutation,
  useGetTestHistoryQuery,
  useGetTestResultDetailQuery,
  useGetUserStatsQuery,
} = testResultApi;
