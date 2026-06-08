import { api } from '@/core/api/api';
import type {
  Resource,
  ResourceSearchParams,
  ResourceSearchResponse,
  TranscriptSegment,
} from '../types/resource.type';

export const resourceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Search resources
    searchResources: builder.query<
      ResourceSearchResponse,
      ResourceSearchParams
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
        return {
          url: '/resources',
          method: 'GET',
          params: Object.fromEntries(queryParams),
        };
      },
      providesTags: ['Resource'],
    }),

    // Get resource by ID
    getResourceById: builder.query<{ data: Resource }, string>({
      query: (id) => ({
        url: `/resources/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Resource', id }],
    }),

    // Get transcript for YouTube video
    getTranscript: builder.mutation<
      { data: TranscriptSegment[] },
      { url: string }
    >({
      query: (body) => ({
        url: '/resources',
        method: 'POST',
        data: body,
      }),
    }),

    // Save transcript and analyze
    saveTranscript: builder.mutation<{ data: Resource }, { url: string }>({
      query: (body) => ({
        url: '/resources/save',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Resource'],
    }),

    // Update resource (admin only)
    updateResource: builder.mutation<
      { data: Resource },
      { id: string; data: Partial<Resource> }
    >({
      query: ({ id, data }) => ({
        url: `/resources/${id}`,
        method: 'PUT',
        data: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Resource', id },
        'Resource',
      ],
    }),

    // Delete resource (admin only)
    deleteResource: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/resources/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Resource', id },
        'Resource',
      ],
    }),

    // Trigger RSS crawl (admin only)
    triggerRssCrawl: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/resources/rss/trigger',
        method: 'GET',
      }),
      invalidatesTags: ['Resource'],
    }),
  }),
});

// Export hooks
export const {
  useSearchResourcesQuery,
  useGetResourceByIdQuery,
  useGetTranscriptMutation,
  useSaveTranscriptMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useTriggerRssCrawlMutation,
} = resourceApi;
