import { api } from '@/core/api/api';

export interface StartSpeakingAttemptRequest {
  toeicSpeakingTestId: string | number;
}

export interface StartSpeakingAttemptResponse {
  testAttemptId: string;
}

export interface SubmitSpeakingQuestionParams {
  testAttemptId: string;
  questionNumber: number;
  file: File | Blob;
}

export interface FinishSpeakingAttemptParams {
  testAttemptId: string;
}

export const speakingAttemptApi = api.injectEndpoints({
  endpoints: (builder) => ({
    startSpeakingAttempt: builder.mutation<
      StartSpeakingAttemptResponse,
      StartSpeakingAttemptRequest
    >({
      query: (body) => ({
        url: '/api/v1/speaking-attempts/start',
        method: 'POST',
        data: body,
      }),
    }),

    submitSpeakingQuestion: builder.mutation<
      { success: boolean },
      SubmitSpeakingQuestionParams
    >({
      query: ({ testAttemptId, questionNumber, file }) => {
        const formData = new FormData();
        formData.append('questionNumber', String(questionNumber));
        const filename =
          (file as File).name ?? `question-${questionNumber}.wav`;
        formData.append('audio', file, filename);
        return {
          url: `/api/v1/speaking-attempts/${testAttemptId}/submit-question`,
          method: 'POST',
          data: formData,
        };
      },
    }),

    finishSpeakingAttempt: builder.mutation<
      { success: boolean },
      FinishSpeakingAttemptParams
    >({
      query: ({ testAttemptId }) => ({
        url: `/api/v1/speaking-attempts/${testAttemptId}/finish`,
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useStartSpeakingAttemptMutation,
  useSubmitSpeakingQuestionMutation,
  useFinishSpeakingAttemptMutation,
} = speakingAttemptApi;
