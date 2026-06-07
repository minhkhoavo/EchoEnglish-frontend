import { api } from '@/core/api/api';

export interface UploadResult {
  key: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}

interface ApiEnvelope<T> {
  message: string;
  data: T;
}

/**
 * Upload media (image / audio) to the existing S3-backed file service. The URL
 * returned is stored on the question/group media exactly like a manually pasted
 * link, so the "link system" keeps working unchanged.
 */
export const adminTestUploadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadTestImage: builder.mutation<UploadResult, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/files/upload-image',
          method: 'POST',
          data: formData,
        };
      },
      transformResponse: (response: ApiEnvelope<UploadResult>) => response.data,
    }),

    uploadTestAudio: builder.mutation<UploadResult, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/files/upload-audio',
          method: 'POST',
          data: formData,
        };
      },
      transformResponse: (response: ApiEnvelope<UploadResult>) => response.data,
    }),
  }),
});

export const { useUploadTestImageMutation, useUploadTestAudioMutation } =
  adminTestUploadApi;
