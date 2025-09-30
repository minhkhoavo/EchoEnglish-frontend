import { api } from '../../../core/api/api';
import type {
  RecordingsListResponse,
  Recording,
} from '../types/recordings.types';

export const recordingsApiRTK = api.injectEndpoints({
  endpoints: (builder) => ({
    getRecordings: builder.query<RecordingsListResponse, void>({
      query: () => ({ url: '/speech/recordings', method: 'GET' }),
      transformResponse: (response: RecordingsListResponse) => {
        // Thêm fallback overallScore = 0 cho các recordings không có trường này
        const transformedData = {
          ...response,
          data: {
            ...response.data,
            items: response.data.items.map((recording) => ({
              ...recording,
              overallScore: recording.overallScore ?? 0,
            })),
          },
        };
        return transformedData;
      },
    }),
    getRecordingById: builder.query<Recording, string>({
      query: (id) => ({ url: `/speech/recordings/${id}`, method: 'GET' }),
      transformResponse: (response: { message: string; data: Recording }) => ({
        ...response.data,
        overallScore: response.data.overallScore ?? 0,
        duration: response.data.duration ?? 0,
        speakingTime: response.data.speakingTime ?? 0,
      }),
    }),
    updateRecording: builder.mutation<Recording, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/speech/recordings/${id}`,
        method: 'PUT',
        data: { name },
      }),
      transformResponse: (response: { message: string; data: Recording }) => ({
        ...response.data,
        overallScore: response.data.overallScore ?? 0,
        duration: response.data.duration ?? 0,
        speakingTime: response.data.speakingTime ?? 0,
      }),
    }),
  }),
});

export const {
  useGetRecordingsQuery,
  useGetRecordingByIdQuery,
  useUpdateRecordingMutation,
} = recordingsApiRTK;
