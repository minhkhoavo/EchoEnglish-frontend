import { api } from '@/core/api/api';
import type { Resource } from '../types/resource.types';

export const adminResourceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateResource: builder.mutation<
      { message: string; data: Resource },
      { id: string; data: { suitableForLearners: boolean } }
    >({
      query: ({ id, data }) => ({
        url: `/resources/${id}`,
        method: 'PATCH',
        data,
      }),
    }),
    deleteResource: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/resources/${id}`,
        method: 'DELETE',
      }),
    }),
    triggerRssCrawl: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/resources/trigger-rss-crawl',
        method: 'POST',
      }),
    }),
    saveTranscript: builder.mutation<
      { message: string; data: Resource },
      { url: string }
    >({
      query: (data) => ({
        url: '/resources/save-transcript',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const {
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useTriggerRssCrawlMutation,
  useSaveTranscriptMutation,
} = adminResourceApi;
