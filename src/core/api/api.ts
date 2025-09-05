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
const axiosBaseQuery =
  (): BaseQueryFn<Args, unknown, Err> =>
  async ({ url, method, data, params }, api) => {
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

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Profile', 'User', 'Category', 'Flashcard'],
  endpoints: () => ({}),
});
