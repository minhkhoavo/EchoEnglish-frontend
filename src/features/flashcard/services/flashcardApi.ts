import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AxiosError } from 'axios';
import axiosInstance from '@/core/api/axios';
import type { Flashcard, Category } from '../types/flashcard.types';
import { mockFlashcards, mockCategories } from '../data/mockData';

type Args = { url: string; method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'; data?: unknown; params?: Record<string, unknown> };
export type Err  = { status?: number; data?: unknown; message?: string };

const axiosBaseQuery = (): BaseQueryFn<Args, unknown, Err> =>
  async ({ url, method, data, params }, api) => {
    try {
      // Comment out real API call and return mock data
      // const res = await axiosInstance.request({ url, method, data, params, signal: api.signal });
      // return { data: res.data };

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay

      if (method === 'GET') {
        if (url === '/flashcards') {
          return { data: mockFlashcards };
        } else if (url === '/categories') {
          return { data: mockCategories };
        } else if (url.startsWith('/flashcards/category/')) {
          const categoryId = url.split('/').pop();
          const category = mockCategories.find(cat => cat.id === categoryId);
          if (category) {
            const filteredFlashcards = mockFlashcards.filter(card => card.category === category.name);
            return { data: filteredFlashcards };
          }
          return { error: { status: 404, data: 'Category not found' } };
        }
      } else if (method === 'POST') {
        if (url === '/flashcards') {
          const newFlashcard = data as Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>;
          const createdFlashcard: Flashcard = {
            ...newFlashcard,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { data: createdFlashcard };
        } else if (url === '/categories') {
          const newCategory = data as Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'flashcardCount'>;
          const createdCategory: Category = {
            ...newCategory,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            flashcardCount: 0,
          };
          return { data: createdCategory };
        }
      } else if (method === 'PUT') {
        if (url.startsWith('/flashcards/')) {
          const id = url.split('/').pop();
          const updates = data as Partial<Flashcard>;
          const flashcard = mockFlashcards.find(card => card.id === id);
          if (flashcard) {
            const updatedFlashcard = { ...flashcard, ...updates, updatedAt: new Date().toISOString() };
            return { data: updatedFlashcard };
          }
          return { error: { status: 404, data: 'Flashcard not found' } };
        } else if (url.startsWith('/categories/')) {
          const id = url.split('/').pop();
          const updates = data as Partial<Category>;
          const category = mockCategories.find(cat => cat.id === id);
          if (category) {
            const updatedCategory = { ...category, ...updates, updatedAt: new Date().toISOString() };
            return { data: updatedCategory };
          }
          return { error: { status: 404, data: 'Category not found' } };
        }
      } else if (method === 'DELETE') {
        if (url.startsWith('/flashcards/')) {
          const id = url.split('/').pop();
          return { data: { id } };
        } else if (url.startsWith('/categories/')) {
          const id = url.split('/').pop();
          return { data: { id } };
        }
      }

      return { error: { status: 404, data: 'Endpoint not mocked' } };
    } catch (e) {
      const err = e as AxiosError;
      
      // Return specific error for server connection issues
      if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED') {
        return { 
          error: { 
            status: 0, 
            data: null,
            message: 'SERVER_DISCONNECTED'
          } 
        };
      }
      
      return { error: { status: err.response?.status, data: err.response?.data ?? err.message } };
    }
  };

export const flashcardApi = createApi({
  reducerPath: 'flashcardApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Flashcard', 'Category'],
  endpoints: (builder) => ({
    getFlashcards: builder.query<Flashcard[], void>({
      query: () => ({
        url: '/flashcards',
        method: 'GET',
      }),
      providesTags: ['Flashcard'],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => ({
        url: '/categories',
        method: 'GET',
      }),
      providesTags: ['Category'],
    }),
    getFlashcardsByCategory: builder.query<Flashcard[], string>({
      query: (categoryId) => ({
        url: `/flashcards/category/${categoryId}`,
        method: 'GET',
      }),
      providesTags: ['Flashcard'],
    }),
    createFlashcard: builder.mutation<Flashcard, Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (newFlashcard) => ({
        url: '/flashcards',
        method: 'POST',
        data: newFlashcard,
      }),
      invalidatesTags: ['Flashcard', 'Category'],
    }),
    updateFlashcard: builder.mutation<Flashcard, Partial<Flashcard> & { id: string }>({
      query: ({ id, ...updates }) => ({
        url: `/flashcards/${id}`,
        method: 'PUT',
        data: updates,
      }),
      invalidatesTags: ['Flashcard'],
    }),
    deleteFlashcard: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/flashcards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Flashcard', 'Category'],
    }),
    createCategory: builder.mutation<Category, Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'flashcardCount'>>({
      query: (newCategory) => ({
        url: '/categories',
        method: 'POST',
        data: newCategory,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, Partial<Category> & { id: string }>({
      query: ({ id, ...updates }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        data: updates,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category', 'Flashcard'],
    }),
  }),
});

export const {
  useGetFlashcardsQuery,
  useGetCategoriesQuery,
  useGetFlashcardsByCategoryQuery,
  useCreateFlashcardMutation,
  useUpdateFlashcardMutation,
  useDeleteFlashcardMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = flashcardApi;
