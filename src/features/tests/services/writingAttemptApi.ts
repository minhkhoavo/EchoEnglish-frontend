import { api } from '@/core/api/api';

export interface SubmitWritingAttemptRequest {
  testId: string;
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}

export interface SubmitWritingAttemptResponse {
  message: string;
  data: {
    resultId: string;
  };
}

export const writingAttemptApi = api.injectEndpoints({
  endpoints: (builder) => ({
    submitWritingAttempt: builder.mutation<
      SubmitWritingAttemptResponse,
      SubmitWritingAttemptRequest
    >({
      query: (body) => {
        // Transform answers array to object with question numbers as keys
        const answersObject: Record<string, string> = {};

        body.answers.forEach((answer) => {
          const questionKey = answer.questionId.toString();
          // ✅ All answers are now plain strings (including essays)
          answersObject[questionKey] = answer.answer;
        });

        return {
          url: '/writing-attempts/submit-and-score',
          method: 'POST',
          data: {
            toeicWritingTestId: body.testId,
            answers: answersObject,
          },
        };
      },
      invalidatesTags: ['WritingTest'],
    }),
  }),
  overrideExisting: false,
});

export const { useSubmitWritingAttemptMutation } = writingAttemptApi;
