import { api } from '../../../core/api/api';
import type {
  Flashcard,
  Category,
  ApiResponse,
  FlashcardsByCategoryResponse,
} from '../types/flashcard.types';

export const flashcardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => ({
        url: '/flashcards/categories',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<Category[]>) => response.data,
      providesTags: [{ type: 'Category' }],
    }),
    createCategory: builder.mutation<
      Category,
      { name: string; description: string; color?: string; icon?: string }
    >({
      query: (body) => ({
        url: '/flashcards/categories',
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: ApiResponse<Category>) => response.data,
      invalidatesTags: [{ type: 'Category' }, { type: 'Flashcard' }],
    }),
    updateCategory: builder.mutation<
      Category,
      {
        id: string;
        name: string;
        description: string;
        color?: string;
        icon?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/flashcards/categories/${id}`,
        method: 'PUT',
        data: body,
      }),
      transformResponse: (response: ApiResponse<Category>) => response.data,
      invalidatesTags: [{ type: 'Category' }, { type: 'Flashcard' }],
    }),
    deleteCategory: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/flashcards/categories/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: [{ type: 'Category' }, { type: 'Flashcard' }],
    }),
    getFlashcards: builder.query<Flashcard[], void>({
      query: () => ({
        url: '/flashcards/',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<Flashcard[]>) => response.data,
      providesTags: [{ type: 'Flashcard' }],
    }),
    createFlashcard: builder.mutation<
      Flashcard,
      {
        front: string;
        back: string;
        category: string;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        tags: string[];
        source?: string;
        isAIGenerated: boolean;
      }
    >({
      query: (body) => ({
        url: '/flashcards/',
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: ApiResponse<Flashcard>) => response.data,
      invalidatesTags: [{ type: 'Flashcard' }],
    }),
    updateFlashcard: builder.mutation<
      Flashcard,
      {
        id: string;
        front: string;
        back: string;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        tags: string[];
        source?: string;
        isAIGenerated: boolean;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/flashcards/${id}`,
        method: 'PUT',
        data: body,
      }),
      transformResponse: (response: ApiResponse<Flashcard>) => response.data,
      invalidatesTags: [{ type: 'Flashcard' }],
    }),
    deleteFlashcard: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/flashcards/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: [{ type: 'Flashcard' }],
    }),
    getFlashcardsByCategory: builder.query<
      FlashcardsByCategoryResponse,
      string
    >({
      query: (categoryId) => ({
        url: `/flashcards/category/${categoryId}`,
        method: 'GET',
      }),
      transformResponse: (
        response: ApiResponse<FlashcardsByCategoryResponse>
      ) => response.data,
      providesTags: [{ type: 'Flashcard' }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetFlashcardsQuery,
  useCreateFlashcardMutation,
  useUpdateFlashcardMutation,
  useDeleteFlashcardMutation,
  useGetFlashcardsByCategoryQuery,
} = flashcardApi;
