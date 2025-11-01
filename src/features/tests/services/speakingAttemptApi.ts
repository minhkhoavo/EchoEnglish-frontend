import { api } from '@/core/api/api';

export interface StartSpeakingAttemptRequest {
  toeicSpeakingTestId: string | number;
  examMode: 'normal' | 'exam';
}

export type StartSpeakingAttemptResponse = SpeakingAttemptData;

export interface SpeakingAttemptData {
  _id: string;
  testAttemptId?: string;
  userId: string;
  toeicSpeakingTestId: string;
  status: 'in_progress' | 'completed';
  totalScore: number;
  level: string;
  examMode: 'normal' | 'exam';
  createdAt: string;
  submissionTimestamp?: string;
  parts: Array<{
    partIndex: number;
    partTitle: string;
    questions: Array<{
      questionNumber: number;
      questionText?: string; // Backend returns questionText, not promptText
      promptText?: string; // Keep for backward compatibility
      promptImage?: string;
      s3AudioUrl: string | null;
      recordingId: string | null;
      result: unknown | null;
    }>;
  }>;
}

export interface SubmitSpeakingQuestionParams {
  testAttemptId: string;
  questionNumber: number;
  file: File | Blob;
}

export interface FinishSpeakingAttemptParams {
  testAttemptId: string;
}

export interface GetAttemptByIdParams {
  attemptId: string;
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
      transformResponse: (response: {
        message: string;
        data: SpeakingAttemptData;
      }) => response.data,
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
