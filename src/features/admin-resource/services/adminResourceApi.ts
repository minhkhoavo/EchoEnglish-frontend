import { api } from '@/core/api/api';
import type {
  Resource,
  CreateArticleData,
  UpdateArticleData,
} from '../types/resource.types';

export const adminResourceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo bài viết mới
    createArticle: builder.mutation<
      { message: string; data: Resource },
      CreateArticleData
    >({
      query: (data) => ({
        url: '/resources/articles',
        method: 'POST',
        data,
      }),
    }),

    // Cập nhật bài viết
    updateArticle: builder.mutation<
      { message: string; data: Resource },
      { id: string; data: UpdateArticleData }
    >({
      query: ({ id, data }) => ({
        url: `/resources/articles/${id}`,
        method: 'PUT',
        data,
      }),
    }),

    // Cập nhật resource (approve/reject)
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

    // Reindex knowledge base
    reindexKnowledge: builder.mutation<
      {
        message: string;
        data: { total: number; success: number; failed: number };
      },
      void
    >({
      query: () => ({
        url: '/resources/knowledge/reindex',
        method: 'POST',
      }),
    }),

    // Upload file (image/attachment) - only upload to S3, no analyze
    uploadAdminFile: builder.mutation<
      { message: string; data: { url: string; key: string } },
      { file: File; folder?: string }
    >({
      query: ({ file, folder }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (folder) formData.append('folder', folder);
        return {
          url: '/files/upload',
          method: 'POST',
          data: formData,
        };
      },
    }),
  }),
});

export const {
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useTriggerRssCrawlMutation,
  useSaveTranscriptMutation,
  useReindexKnowledgeMutation,
  useUploadAdminFileMutation,
} = adminResourceApi;
