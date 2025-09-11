import { api } from '../../../core/api/api';
import type {
  RecordingsListResponse,
  Recording,
} from '../types/recordings.types';

export const recordingsApiRTK = api.injectEndpoints({
  endpoints: (builder) => ({
    getRecordings: builder.query<RecordingsListResponse, void>({
      query: () => ({ url: '/speech/recordings', method: 'GET' }),
      transformResponse: (response: RecordingsListResponse) => response,
      providesTags: ['Profile'],
    }),
    getRecordingById: builder.query<Recording, string>({
      query: (id) => ({ url: `/speech/recordings/${id}`, method: 'GET' }),
      transformResponse: (response: { message: string; data: Recording }) =>
        response.data,
      providesTags: (result, error, id) => [{ type: 'Profile', id }],
    }),
  }),
});

export const { useGetRecordingsQuery, useGetRecordingByIdQuery } =
  recordingsApiRTK;
