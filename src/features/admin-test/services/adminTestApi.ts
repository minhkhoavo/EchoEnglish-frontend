import { api } from '@/core/api/api';
import type {
  AdminTest,
  AdminTestsResponse,
  ApiResponse,
  CreateTestRequest,
  UpdateTestRequest,
  AdminTestListItem,
} from '../types/admin-test.types';

export const adminTestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tests with pagination
    getAdminTests: builder.query<
      AdminTestsResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search }) => ({
        url: '/admin/tests',
        method: 'GET',
        params: { page, limit, search },
      }),
      transformResponse: (response: ApiResponse<AdminTestsResponse>) =>
        response.data,
      providesTags: ['Test'],
    }),

    // Get single test by ID
    getAdminTestById: builder.query<AdminTest, string>({
      query: (id) => ({
        url: `/admin/tests/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AdminTest>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Test', id }],
    }),

    // Create new test
    createTest: builder.mutation<AdminTest, CreateTestRequest>({
      query: (data) => ({
        url: '/admin/tests',
        method: 'POST',
        data,
      }),
      transformResponse: (response: ApiResponse<AdminTest>) => response.data,
      invalidatesTags: ['Test'],
    }),

    // Update test
    updateTest: builder.mutation<
      AdminTest,
      { id: string; data: UpdateTestRequest }
    >({
      query: ({ id, data }) => ({
        url: `/admin/tests/${id}`,
        method: 'PUT',
        data,
      }),
      transformResponse: (response: ApiResponse<AdminTest>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Test', id },
        'Test',
      ],
    }),

    // Delete test
    deleteTest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/tests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Test'],
    }),

    // Import from Excel
    importTestFromExcel: builder.mutation<
      AdminTest,
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/admin/tests/${id}/import`,
          method: 'POST',
          data: formData,
        };
      },
      transformResponse: (response: ApiResponse<AdminTest>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Test', id },
        'Test',
      ],
    }),

    // Export to Excel
    exportTestToExcel: builder.query<Blob, string>({
      query: (id) => ({
        url: `/admin/tests/${id}/export`,
        method: 'GET',
        responseType: 'blob',
      }),
    }),
  }),
});

export const {
  useGetAdminTestsQuery,
  useGetAdminTestByIdQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  useImportTestFromExcelMutation,
  useLazyExportTestToExcelQuery,
} = adminTestApi;

// Export template download URL
export const getTemplateDownloadUrl = () => '/api/admin/tests/template';
