import { api } from '@/core/api/api';
import type {
  UserPreferences,
  UserPreferencesPartial,
  GenerateLearningPlanRequest,
  LearningPlan,
} from '../types';

export interface TestCompletionResponse {
  message: string;
  data: {
    hasTest: boolean;
    firstTest: {
      id: string;
      testTitle: string;
      completedAt: string;
      listeningScore: number;
      readingScore: number;
      isAnalyzed: boolean;
    };
    totalTests: number;
    message: string;
  };
}

export const learningPlanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get user preferences
    getUserPreferences: builder.query<UserPreferences, void>({
      query: () => ({
        url: '/users/preferences',
        method: 'GET',
      }),
      transformResponse: (
        response: UserPreferences | { data: UserPreferences }
      ) => {
        return 'data' in response ? response.data : response;
      },
      providesTags: ['UserPreferences'],
    }),

    // Update user preferences (full or partial)
    updateUserPreferences: builder.mutation<
      UserPreferences,
      UserPreferencesPartial
    >({
      query: (preferences: UserPreferencesPartial) => ({
        url: '/users/preferences',
        method: 'PUT',
        data: preferences,
      }),
      invalidatesTags: ['UserPreferences'],
    }),

    // Get active learning plan
    getActiveLearningPlan: builder.query<LearningPlan, void>({
      query: () => ({
        url: '/learning-plans/active',
        method: 'GET',
      }),
      providesTags: ['LearningPlan'],
    }),

    // Generate learning plan with AI
    generateLearningPlan: builder.mutation<
      LearningPlan,
      GenerateLearningPlanRequest
    >({
      query: (request: GenerateLearningPlanRequest) => ({
        url: '/learning-plans/generate',
        method: 'POST',
        data: request,
      }),
      invalidatesTags: ['LearningPlan', 'UserPreferences'],
    }),

    // Check if user has completed a placement test
    checkTestCompletion: builder.query<TestCompletionResponse, void>({
      query: () => ({
        url: '/learning-plans/first-test',
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useGetActiveLearningPlanQuery,
  useGenerateLearningPlanMutation,
  useCheckTestCompletionQuery,
} = learningPlanApi;
