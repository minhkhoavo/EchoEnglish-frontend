import { api } from '../../../core/api/api';
import type { ContentItem} from '../types/content.types';
import axiosInstance from '../../../core/api/axios';

interface FileApiResponse {
  id: number;
  file_name: string;
  file_type: string;
  language: string | null;
  file_size_kb: number;
  tags_part: string[];
  status: string;
  s3_url: string;
  user_id: number;
  upload_timestamp: string;
}

export const contentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchUserFiles: builder.query<ContentItem[], number>({
      query: (userId) => ({
        url: `/${userId}/files`,
        method: 'GET',
      }),
      transformResponse: (response: unknown[]) => {
        // Map backend response to frontend ContentItem format
        return (response as FileApiResponse[]).map((file) => ({
          id: file.id.toString(),
          name: file.file_name,
          type: file.file_type.startsWith('image/') ? 'image' as const : 'file' as const,
          size: `${(file.file_size_kb / 1024).toFixed(2)} MB`,
          url: file.s3_url,
          preview: file.file_type.startsWith('image/') ? file.s3_url : undefined,
          status: file.status === 'Indexed' ? 'ready' as const : 'processing' as const,
          insights: {
            difficulty: 'Beginner' as const,
            topics: file.tags_part || [],
            readingTime: '5 min',
            vocabulary: 0,
            suggestedQuizzes: 5,
            suggestedFlashcards: 10,
          },
        }));
      },
    }),
    uploadFile: builder.mutation<{success: boolean; message: string}, { file: File; id: string }>({
      queryFn: async ({ file }, { signal }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', '88'); 

        try {
          const response = await axiosInstance.post(
            '/uploadfile/',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              signal, 
              onUploadProgress: () => {
                // Progress tracking if needed
              },
            }
          );
          return { data: response.data };
        } catch (axiosError) {
          const err = axiosError as {response?: {status: number; data: unknown}};
          return {
            error: {
              status: err.response?.status,
              data: err.response?.data,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useUploadFileMutation,
  useFetchUserFilesQuery,
  useLazyFetchUserFilesQuery
} = contentApi;
