import { api } from '@/core/api/api';
import type {
  UserPreferences,
  UserPreferencesPartial,
  GenerateLearningPlanRequest,
  LearningPlan,
} from '../types';

export const learningPlanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get user preferences
    getUserPreferences: builder.query<UserPreferences, void>({
      query: () => ({
        url: '/users/preferences',
        method: 'GET',
      }),
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
      invalidatesTags: ['LearningPlan'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useGetActiveLearningPlanQuery,
  useGenerateLearningPlanMutation,
} = learningPlanApi;
