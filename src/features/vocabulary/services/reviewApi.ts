import { api } from '../../../core/api/api';
import type {
  Flashcard,
  ReviewStatistics,
  DueFlashcardsResponse,
} from '../types/review.types';
import type { ApiResponse } from '../../flashcard/types/flashcard.types';

export const reviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get flashcards due for review
    getDueFlashcards: builder.query<
      DueFlashcardsResponse,
      { limit?: number; categoryId?: string }
    >({
      query: ({ limit = 20, categoryId }) => ({
        url: '/reviews/due',
        method: 'GET',
        params: { limit, categoryId },
      }),
      transformResponse: (response: ApiResponse<DueFlashcardsResponse>) =>
        response.data,
      providesTags: ['Review'],
    }),

    // Submit review result
    submitReview: builder.mutation<
      Flashcard,
      { flashcardId: string; result: 'forgot' | 'remember' }
    >({
      query: (body) => ({
        url: '/reviews/submit',
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: ApiResponse<Flashcard>) => response.data,
      invalidatesTags: ['Review', 'Flashcard'],
    }),

    // Get review statistics
    getReviewStatistics: builder.query<
      ReviewStatistics,
      { categoryId?: string } | undefined
    >({
      query: (params) => ({
        url: '/reviews/statistics',
        method: 'GET',
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<ReviewStatistics>) =>
        response.data,
      providesTags: ['Review'],
    }),

    // Reset review progress (for testing)
    resetReviewProgress: builder.mutation<{ modifiedCount: number }, void>({
      query: () => ({
        url: '/reviews/reset',
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<{ modifiedCount: number }>) =>
        response.data,
      invalidatesTags: ['Review', 'Flashcard'],
    }),
  }),
});

export const {
  useGetDueFlashcardsQuery,
  useLazyGetDueFlashcardsQuery,
  useSubmitReviewMutation,
  useGetReviewStatisticsQuery,
  useLazyGetReviewStatisticsQuery,
  useResetReviewProgressMutation,
} = reviewApi;
