import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Quiz,
  QuizQuestionBuilder,
  QuizQuestion,
} from '../types/quiz.type';

export const quizApi = createApi({
  reducerPath: 'quizApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/' }),
  endpoints: (builder) => ({
    getQuizById: builder.query<Quiz, { fileId?: string }>({
      queryFn: async ({ fileId }) => {
        try {
          const formData = new FormData();
          formData.append('part', '6');
          formData.append('user_id', '88');
          if (fileId) {
            formData.append('file_ids', fileId);
          }

          const response = await fetch(
            'http://localhost:8001/api/v1/generate/quiz/',
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!response.ok) {
            return {
              error: { status: response.status, data: await response.text() },
            };
          }

          const data: Quiz = await response.json();
          return { data: { ...data, totalTime: 15 } };
        } catch (error: unknown) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: (error as Error)?.message || 'Unknown error',
            },
          };
        }
      },
    }),
    generateQuiz: builder.mutation<Quiz, { fileId?: string }>({
      queryFn: async ({ fileId }) => {
        try {
          const formData = new FormData();
          formData.append('part', '6'); // Default part as per instruction
          formData.append('user_id', '88'); // Default user_id as per instruction
          if (fileId) {
            formData.append('file_ids', fileId);
          }

          const response = await fetch(
            'http://localhost:8001/api/v1/generate/quiz/',
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!response.ok) {
            return {
              error: { status: response.status, data: await response.text() },
            };
          }

          const data: Quiz = await response.json();
          return {
            data: {
              ...data,
              totalTime: 15,
              id: 'toeic-sample-1',
              title: 'TOEIC Listening & Reading Practice',
              description:
                'A comprehensive practice quiz covering listening and reading skills',
            },
          };
        } catch (error: unknown) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: (error as Error)?.message || 'Unknown error',
            },
          };
        }
      },
    }),
    createQuiz: builder.mutation<Quiz, QuizQuestionBuilder[]>({
      queryFn: (questions) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const newQuiz: Quiz = {
              id: `new-quiz-${Date.now()}`,
              title: 'Generated Quiz',
              description: 'Quiz created from builder',
              totalTime: 600,
              questions: questions.map((q, index) => ({
                id: `gen-q${index + 1}`,
                type: 'multiple-choice',
                question: { text: q.question },
                options: q.options.map((opt: string, i: number) => ({
                  id: String.fromCharCode(97 + i),
                  text: opt,
                })),
                correctAnswer: String.fromCharCode(97 + q.correctAnswer),
                explanation: q.explanation
                  ? { text: q.explanation }
                  : undefined,
              })),
            };
            resolve({ data: newQuiz });
          }, 500);
        });
      },
    }),
    submitQuizAnswers: builder.mutation<
      { score: number; total: number; correctAnswers: Record<string, boolean> },
      { quiz: Quiz; answers: Record<string, string> }
    >({
      queryFn: ({ quiz, answers }) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            let correct = 0;
            const correctAnswers: Record<string, boolean> = {};

            // Calculate the score by comparing user answers with correct answers
            quiz.questions.forEach((question: QuizQuestion) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              correctAnswers[question.id] = isCorrect;

              if (isCorrect) {
                correct++;
              }
            });

            const result = {
              score: correct,
              total: quiz.questions.length,
              correctAnswers,
            };
            resolve({ data: result });
          }, 500);
        });
      },
    }),
  }),
});

export const {
  useGetQuizByIdQuery,
  useGenerateQuizMutation,
  useCreateQuizMutation,
  useSubmitQuizAnswersMutation,
} = quizApi;
