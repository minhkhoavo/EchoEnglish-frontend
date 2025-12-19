import { api } from '../../../core/api/api';
import type {
  VocabularySet,
  VocabularyWord,
  VocabularyWordsResponse,
  PhoneticsResponse,
  ImportResponse,
  BulkImportResponse,
} from '../types/vocabulary.types';
import type { ApiResponse } from '../../flashcard/types/flashcard.types';

export const vocabularyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all vocabulary sets
    getVocabularySets: builder.query<VocabularySet[], void>({
      query: () => ({
        url: '/vocabulary/sets',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<VocabularySet[]>) =>
        response.data,
    }),

    // Get words from a specific set
    getWordsBySet: builder.query<
      VocabularyWordsResponse,
      {
        fileName: string;
        page?: number;
        limit?: number;
        importStatus?: 'all' | 'imported' | 'not-imported';
      }
    >({
      query: ({ fileName, page = 1, limit = 20, importStatus = 'all' }) => ({
        url: `/vocabulary/sets/${fileName}/words`,
        method: 'GET',
        params: { page, limit, importStatus },
      }),
      transformResponse: (response: ApiResponse<VocabularyWordsResponse>) =>
        response.data,
    }),

    // Search vocabulary
    searchVocabulary: builder.query<
      VocabularyWord[],
      { query: string; fileName?: string }
    >({
      query: ({ query, fileName }) => ({
        url: '/vocabulary/search',
        method: 'GET',
        params: { q: query, fileName },
      }),
      transformResponse: (response: ApiResponse<VocabularyWord[]>) =>
        response.data,
    }),

    // Get word by ID
    getWordById: builder.query<VocabularyWord, string>({
      query: (cardId) => ({
        url: `/vocabulary/words/${cardId}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<VocabularyWord>) =>
        response.data,
    }),

    // Get phonetics for a word
    getPhonetics: builder.query<PhoneticsResponse, string>({
      query: (word) => ({
        url: `/vocabulary/phonetics/${word}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<PhoneticsResponse>) =>
        response.data,
    }),

    // Import word to flashcard
    importToFlashcard: builder.mutation<
      ImportResponse,
      { cardId: string; categoryId?: string; difficulty?: string }
    >({
      query: (body) => ({
        url: '/vocabulary/import',
        method: 'POST',
        data: body,
      }),
      // Backend returns { message, data } at root level
      transformResponse: (response: ImportResponse) => ({
        message: response.message,
        data: response.data,
      }),
      invalidatesTags: ['Flashcard', 'Category'],
    }),

    // Bulk import entire vocabulary set
    bulkImportToFlashcards: builder.mutation<
      BulkImportResponse,
      { fileName: string; categoryId?: string }
    >({
      query: (body) => ({
        url: '/vocabulary/bulk-import',
        method: 'POST',
        data: body,
      }),
      // Backend returns { message, data } at root level
      transformResponse: (response: BulkImportResponse) => ({
        message: response.message,
        data: response.data,
      }),
      invalidatesTags: ['Flashcard', 'Category'],
    }),
  }),
});

export const {
  useGetVocabularySetsQuery,
  useGetWordsBySetQuery,
  useSearchVocabularyQuery,
  useLazySearchVocabularyQuery,
  useGetWordByIdQuery,
  useGetPhoneticsQuery,
  useLazyGetPhoneticsQuery,
  useImportToFlashcardMutation,
  useBulkImportToFlashcardsMutation,
} = vocabularyApi;
