import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AxiosError } from 'axios';
import axiosInstance from './axios';

type Args = {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
  params?: Record<string, unknown>;
};

type Err = { status?: number; data?: unknown };

function axiosBaseQuery(): BaseQueryFn<Args, unknown, Err> {
  return async function baseQuery({ url, method, data, params }, api) {
    try {
      const res = await axiosInstance.request({
        url,
        method,
        data,
        params,
        signal: api.signal,
      });
      return { data: res.data };
    } catch (e) {
      const err = e as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data ?? err.message,
        },
      };
    }
  };
}

// Create API slice, similar to createSlice
export const api = createApi({
  reducerPath: 'api', // name of the slice in Redux store, state will be state.api
  baseQuery: axiosBaseQuery(), // API calling engine (axios)
  tagTypes: [
    'Profile',
    'User',
    'Category',
    'Flashcard',
    'Test',
    'TestResult',
    'SWTest',
    'SpeakingTest',
    'WritingTest',
    'SpeakingWritingTest',
    'Payment',
    'Chatbot',
    'Notification',
    'Resource',
    'Dashboard',
    'DailyLesson',
    'UserPreferences',
    'LearningPlan',
  ], // tag types for cache management
  endpoints: () => ({}), // specific endpoints will be added in other files
});
// createApi automatically generates a reducer to manage API slice state (cache, loading, error), located in api.reducer.
